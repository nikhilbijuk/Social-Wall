import { turso } from '../lib/turso';
import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';

export interface Post {
  id: string;
  content: string;
  type: 'update' | 'event' | 'alert';
  tag: string;
  fileUrl?: string;
  mediaType?: 'image' | 'video';
  likes_count: number;
  thumbs_up_count: number;
  timestamp: number;
}

interface AppContextType {
  posts: Post[];
  isLoading: boolean;
  loadingProgress: number;
  hasMore: boolean;
  loadMorePosts: () => Promise<void>;
  addPost: (post: Omit<Post, 'id' | 'timestamp' | 'likes_count' | 'thumbs_up_count'>) => Promise<void>;
  handleLike: (postId: string, currentLikes: number) => Promise<void>;
  handleThumbUp: (postId: string, currentThumbs: number) => Promise<void>;
  login: (email: string, team: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const latestTimestampRef = useRef<number>(0);
  const oldestTimestampRef = useRef<number>(Date.now());

  // Check for critical configuration
  if (!import.meta.env.VITE_TURSO_DB_URL || !import.meta.env.VITE_TURSO_AUTH_TOKEN) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4 text-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md">
          <h1 className="text-xl font-bold text-red-600 mb-4">Configuration Missing</h1>
          <p className="text-gray-700 mb-4">
            The application cannot connect to the database because environment variables are missing.
          </p>
          <div className="bg-gray-100 p-3 rounded text-left text-xs font-mono text-gray-600 overflow-x-auto">
            <p>VITE_TURSO_DB_URL: {import.meta.env.VITE_TURSO_DB_URL ? '✅ Set' : '❌ Missing'}</p>
            <p>VITE_TURSO_AUTH_TOKEN: {import.meta.env.VITE_TURSO_AUTH_TOKEN ? '✅ Set' : '❌ Missing'}</p>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Please configure your .env file or build secrets.
          </p>
        </div>
      </div>
    );
  }

  const ensureTableExists = async () => {
    try {
      // Create table if not exists with new schema
      await turso.execute(`
        CREATE TABLE IF NOT EXISTS posts (
          id TEXT PRIMARY KEY,
          content TEXT,
          type TEXT,
          tag TEXT,
          file_url TEXT,
          media_type TEXT,
          likes_count INTEGER DEFAULT 0,
          thumbs_up_count INTEGER DEFAULT 0,
          timestamp INTEGER
        );
      `);

      // Migration: Add columns if they don't exist (primitive migration)
      try {
        await turso.execute("ALTER TABLE posts ADD COLUMN file_url TEXT");
        console.log("Added file_url column");
      } catch (e) { /* ignore if exists */ }

      try {
        await turso.execute("ALTER TABLE posts ADD COLUMN media_type TEXT");
        console.log("Added media_type column");
      } catch (e) { /* ignore if exists */ }

      try { await turso.execute("ALTER TABLE posts ADD COLUMN thumbs_up_count INTEGER DEFAULT 0"); } catch (e) { }

      await turso.execute(`
        CREATE INDEX IF NOT EXISTS idx_posts_timestamp ON posts(timestamp DESC);
      `);
      console.log("Database schema verified.");
    } catch (error) {
      console.error("Error verifying schema:", error);
    }
  };

  const processRows = (rows: any[]): Post[] => {
    return rows.map((row: any) => ({
      id: row.id as string,
      content: row.content as string,
      type: row.type as 'update' | 'event' | 'alert',
      tag: row.tag as string,
      fileUrl: (row.file_url) || (row.imageUrl) || (row.videoUrl) || undefined,
      mediaType: (row.media_type as 'image' | 'video') || (row.videoUrl ? 'video' : row.imageUrl ? 'image' : undefined),
      likes_count: row.likes_count as number,
      thumbs_up_count: (row.thumbs_up_count) || 0,
      timestamp: row.timestamp as number,
    }));
  };

  const fetchPosts = async (isInitial = false) => {
    try {
      // Load only viewport-sized batch initially (3-5 posts fit on screen)
      let query = 'SELECT * FROM posts ORDER BY timestamp DESC LIMIT 5';
      let args: any[] = [];

      if (!isInitial && latestTimestampRef.current > 0) {
        // Polling for NEWER posts
        query = 'SELECT * FROM posts WHERE timestamp > ? ORDER BY timestamp DESC';
        args = [latestTimestampRef.current];
      }

      const result = await turso.execute({ sql: query, args });

      if (result.rows.length === 0) return;

      const newPosts = processRows(result.rows);

      if (isInitial) {
        // Progressive loading: Add posts in batches to prevent UI blocking
        const BATCH_SIZE = 5;
        for (let i = 0; i < newPosts.length; i += BATCH_SIZE) {
          const batch = newPosts.slice(i, i + BATCH_SIZE);
          setPosts((prev) => [...prev, ...batch]);

          // Update progress
          const progress = 40 + Math.floor((i / newPosts.length) * 60);
          setLoadingProgress(progress);

          // Small delay to allow UI to update
          if (i + BATCH_SIZE < newPosts.length) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }

        if (newPosts.length > 0) {
          latestTimestampRef.current = newPosts[0].timestamp;
          // Set oldest timestamp for pagination
          const oldest = newPosts[newPosts.length - 1].timestamp;
          oldestTimestampRef.current = oldest;
        }
      } else {
        setPosts((prev) => {
          const existingIds = new Set(prev.map(p => p.id));
          const filteredNew = newPosts.filter(p => !existingIds.has(p.id));
          if (filteredNew.length === 0) return prev;

          const updatedPosts = [...filteredNew, ...prev];
          latestTimestampRef.current = updatedPosts[0].timestamp;
          return updatedPosts;
        });
      }
    } catch (error) {
      console.error('Error fetching posts from Turso:', error);
    }
  };

  const loadMorePosts = async () => {
    if (!hasMore || isLoading) return;

    try {
      const query = 'SELECT * FROM posts WHERE timestamp < ? ORDER BY timestamp DESC LIMIT 5';
      const args = [oldestTimestampRef.current];

      const result = await turso.execute({ sql: query, args });

      if (result.rows.length === 0) {
        setHasMore(false);
        return;
      }

      const olderPosts = processRows(result.rows);

      setPosts(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const filtered = olderPosts.filter(p => !existingIds.has(p.id));
        return [...prev, ...filtered];
      });

      // Update oldest timestamp
      const lastPost = olderPosts[olderPosts.length - 1];
      oldestTimestampRef.current = lastPost.timestamp;

    } catch (error) {
      console.error("Error loading more posts:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      setLoadingProgress(10);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), 5000)
      );

      try {
        await Promise.race([
          (async () => {
            await ensureTableExists();
            setLoadingProgress(40);
            await fetchPosts(true);
            setLoadingProgress(100);
          })(),
          timeoutPromise
        ]);

        setTimeout(() => setIsLoading(false), 500);
      } catch (error) {
        if (error instanceof Error && error.message === 'TIMEOUT') {
          console.error("Database connection timed out.");
          setLoadingProgress(0);
          alert("The database is taking longer than usual to respond. We are still trying to connect in the background...");
          setIsLoading(false);
        } else {
          console.error("Initialization error:", error);
          setIsLoading(false);
        }
      }
    };
    init();

    // Polling with tab visibility optimization
    let intervalId: NodeJS.Timeout | null = null;

    const startPolling = () => {
      if (intervalId) return; // Already polling

      intervalId = setInterval(() => {
        // Double-check visibility before fetching
        if (document.visibilityState === 'visible') {
          fetchPosts(false);
        }
      }, 20000); // Poll every 20s when visible
    };

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    // Handle visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab visible - resuming database polling');
        startPolling();
        // Fetch immediately when tab becomes visible
        fetchPosts(false);
      } else {
        console.log('Tab hidden - pausing database polling');
        stopPolling();
      }
    };

    // Start polling if tab is visible
    if (document.visibilityState === 'visible') {
      startPolling();
    }

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // Run once on mount


  const handleLike = async (postId: string, currentLikes: number) => {
    // Optimistic Update
    const newLikes = (currentLikes || 0) + 1;
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, likes_count: newLikes } : post
      )
    );

    try {
      await turso.execute({
        sql: 'UPDATE posts SET likes_count = ? WHERE id = ?',
        args: [newLikes, postId],
      });
    } catch (error) {
      console.error('Error updating likes:', error);
      // Revert if failed
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, likes_count: currentLikes } : post
        )
      );
    }
  };

  const handleThumbUp = async (postId: string, currentThumbs: number) => {
    const newThumbs = (currentThumbs || 0) + 1;
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, thumbs_up_count: newThumbs } : post
      )
    );

    try {
      await turso.execute({
        sql: 'UPDATE posts SET thumbs_up_count = ? WHERE id = ?',
        args: [newThumbs, postId],
      });
    } catch (error) {
      console.error('Error updating thumbs up:', error);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, thumbs_up_count: currentThumbs } : post
        )
      );
    }
  };

  const addPost = async (newPost: Omit<Post, 'id' | 'timestamp' | 'likes_count' | 'thumbs_up_count'>) => {
    const id = crypto.randomUUID();
    const timestamp = Date.now();
    const likes_count = 0;
    const thumbs_up_count = 0;

    const postToSave: Post = {
      ...newPost,
      id,
      timestamp,
      likes_count,
      thumbs_up_count
    };

    // Optimistic UI update
    setPosts((prev) => {
      const updated = [postToSave, ...prev];
      latestTimestampRef.current = Math.max(latestTimestampRef.current, postToSave.timestamp);
      return updated;
    });

    try {
      await turso.execute({
        sql: 'INSERT INTO posts (id, content, type, tag, file_url, media_type, likes_count, thumbs_up_count, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: [
          postToSave.id,
          postToSave.content,
          postToSave.type,
          postToSave.tag,
          postToSave.fileUrl || null,
          postToSave.mediaType || null,
          postToSave.likes_count,
          postToSave.thumbs_up_count,
          postToSave.timestamp
        ],
      });
      console.log("Post successfully saved to database");
    } catch (error) {
      console.error('Database Error:', error);
      // Remove optimistic post on failure
      setPosts((prev) => prev.filter(p => p.id !== id));

      // Provide more specific error messages
      let errorMessage = 'Upload Failed: ';
      if (error instanceof Error) {
        if (error.message.includes('SQLITE_TOOBIG') || error.message.includes('too large')) {
          errorMessage += 'File is too large for database. Try compressing further.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage += 'Network error. Check your connection and try again.';
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += 'Unknown error occurred. Please try again.';
      }

      alert(errorMessage);
      throw error; // Re-throw so the UI knows it failed
    }
  };
  const login = async (email: string, team: string) => {
    // Simple mock login - in a real app, this would verify credentials
    console.log('Logging in:', { email, team });
    localStorage.setItem('social-wall-auth', JSON.stringify({ email, team, timestamp: Date.now() }));
    return Promise.resolve();
  };

  return (
    <AppContext.Provider value={{ posts, isLoading, loadingProgress, hasMore, loadMorePosts, addPost, handleLike, handleThumbUp, login }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}