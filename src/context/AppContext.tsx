import { createContext, useContext, useState, type ReactNode } from 'react';

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
  addPost: (post: Omit<Post, 'id' | 'timestamp'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_POSTS: Post[] = [];

export function AppProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);

  const addPost = (newPost: Omit<Post, 'id' | 'timestamp'>) => {
    const post: Post = {
      ...newPost,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
    };
    setPosts((prev) => [post, ...prev]);
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