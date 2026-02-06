import { turso } from '../lib/turso';
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

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
  // Change 2: Updated addPost signature - no File, but separate image/video URLs
  addPost: (post: Omit<Post, 'id' | 'timestamp' | 'likes_count'>) => Promise<void>;
  handleLike: (postId: string, currentLikes: number) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);

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

  const fetchPosts = async () => {
    try {
      const result = await turso.execute('SELECT * FROM posts ORDER BY timestamp DESC LIMIT 40');
      // Map rows to Post objects
      const fetchedPosts: Post[] = result.rows.map((row: any) => ({
        id: row.id as string,
        content: row.content as string,
        type: row.type as 'update' | 'event' | 'alert',
        tag: row.tag as string,
        imageUrl: row.imageUrl as string,
        videoUrl: row.videoUrl as string,
        likes_count: row.likes_count as number,
        timestamp: row.timestamp as number,
      }));
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts from Turso:', error);
    }
  };

  useEffect(() => {
    // Initial fetch and schema check
    const init = async () => {
      await ensureTableExists();
      await fetchPosts();
    };
    init();

    // Auto-refresh polling every 10 seconds
    const interval = setInterval(fetchPosts, 10000);
    return () => clearInterval(interval);
  }, []);

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
    setPosts((prev) => [postToSave, ...prev]);

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
    <AppContext.Provider value={{ posts, addPost, handleLike }}>
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