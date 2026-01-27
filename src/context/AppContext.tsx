import { supabase } from '../lib/supabase'
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

// 1. Post Interface
export interface Post {
  id: string;
  content: string;
  type: 'update' | 'event' | 'alert';
  tag: string;
  imageUrl?: string; 
  timestamp: number;
}

interface AppContextType {
  posts: Post[];
  addPost: (post: Omit<Post, 'id' | 'timestamp'>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);

  // 2. Fetch posts from Supabase on mount
  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching:', error.message);
      } else if (data) {
        setPosts(data);
      }
    };
    fetchPosts();
  }, []);

  // 3. Add new post to Supabase
  const addPost = async (newPost: Omit<Post, 'id' | 'timestamp'>) => {
    const { data, error } = await supabase
      .from('posts')
      .insert([{ 
        content: newPost.content,
        type: newPost.type,
        tag: newPost.tag,
        imageUrl: newPost.imageUrl,
        timestamp: Date.now() 
      }])
      .select();

    if (error) {
      console.error('Database Error:', error.message);
      return;
    }

    if (data) {
      setPosts((prev) => [data[0], ...prev]);
    }
  };

  return (
    <AppContext.Provider value={{ posts, addPost }}>
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