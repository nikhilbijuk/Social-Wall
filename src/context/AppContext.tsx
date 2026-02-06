import { turso } from '../lib/turso';
import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';

export interface Post {
  id: string;
  content: string;
  type: 'update' | 'event' | 'alert';
  tag: string;
  imageUrl?: string;
  videoUrl?: string; // Change 1: Added videoUrl
  likes_count: number;
  timestamp: number;
}

interface AppContextType {
  posts: Post[];
  isLoading: boolean;
  loadingProgress: number;
  addPost: (post: Omit<Post, 'id' | 'timestamp' | 'likes_count'>) => Promise<void>;
  handleLike: (postId: string, currentLikes: number) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const latestTimestampRef = useRef<number>(0);

  const ensureTableExists = async () => {
    try {
      await turso.execute(`
        CREATE TABLE IF NOT EXISTS posts (
          id TEXT PRIMARY KEY,
          content TEXT,
          type TEXT,
          tag TEXT,
          imageUrl TEXT,
          videoUrl TEXT,
          likes_count INTEGER DEFAULT 0,
          timestamp INTEGER
        );
      `);
      console.log("Database schema verified.");
    } catch (error) {
      console.error("Error verifying schema:", error);
    }
  };

  const fetchPosts = async (isInitial = false) => {
    try {
      let query = 'SELECT * FROM posts ORDER BY timestamp DESC LIMIT 20';
      let args: any[] = [];

      if (!isInitial && latestTimestampRef.current > 0) {
        query = 'SELECT * FROM posts WHERE timestamp > ? ORDER BY timestamp DESC';
        args = [latestTimestampRef.current];
      }

      const result = await turso.execute({ sql: query, args });

      if (result.rows.length === 0) return;

      const newPosts: Post[] = result.rows.map((row: any) => ({
        id: row.id as string,
        content: row.content as string,
        type: row.type as 'update' | 'event' | 'alert',
        tag: row.tag as string,
        imageUrl: (row.imageUrl as string) || undefined,
        videoUrl: (row.videoUrl as string) || undefined,
        likes_count: row.likes_count as number,
        timestamp: row.timestamp as number,
      }));

      if (isInitial) {
        setPosts(newPosts);
        if (newPosts.length > 0) {
          latestTimestampRef.current = newPosts[0].timestamp;
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

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      setLoadingProgress(10);
      await ensureTableExists();
      setLoadingProgress(40);
      await fetchPosts(true);
      setLoadingProgress(100);

      // Small delay to show 100%
      setTimeout(() => setIsLoading(false), 500);
    };
    init();

    const interval = setInterval(() => fetchPosts(false), 10000);
    return () => clearInterval(interval);
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

  const addPost = async (newPost: Omit<Post, 'id' | 'timestamp' | 'likes_count'>) => {
    const id = crypto.randomUUID();
    const timestamp = Date.now();
    const likes_count = 0;

    const postToSave: Post = {
      ...newPost,
      id,
      timestamp,
      likes_count
    };

    // Optimistic UI update
    setPosts((prev) => {
      const updated = [postToSave, ...prev];
      latestTimestampRef.current = Math.max(latestTimestampRef.current, postToSave.timestamp);
      return updated;
    });

    try {
      await turso.execute({
        sql: 'INSERT INTO posts (id, content, type, tag, imageUrl, videoUrl, likes_count, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        args: [
          postToSave.id,
          postToSave.content,
          postToSave.type,
          postToSave.tag,
          postToSave.imageUrl || null,
          postToSave.videoUrl || null,
          postToSave.likes_count,
          postToSave.timestamp
        ],
      });
    } catch (error) {
      console.error('Database Error:', error);
      // Remove optimistic post on failure
      setPosts((prev) => prev.filter(p => p.id !== id));
      alert(`Upload Failed: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
      throw error; // Re-throw so the UI knows it failed
    }
  };

  return (
    <AppContext.Provider value={{ posts, isLoading, loadingProgress, addPost, handleLike }}>
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