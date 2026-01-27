import { supabase } from '../lib/supabase'
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

// 1. Updated Post Interface to include likes_count
export interface Post {
  id: string;
  content: string;
  type: 'update' | 'event' | 'alert';
  tag: string;
  imageUrl?: string; 
  likes_count: number; // Added this line
  timestamp: number;
}

interface AppContextType {
  posts: Post[];
  addPost: (post: Omit<Post, 'id' | 'timestamp' | 'likes_count'>, file?: File) => Promise<void>;
  handleLike: (postId: string, currentLikes: number) => Promise<void>; // Added this line
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);

  // 2. Fetch posts from Supabase on mount
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

  useEffect(() => {
    fetchPosts();
  }, []);

  // 3. New handleLike function
  const handleLike = async (postId: string, currentLikes: number) => {
    const { error } = await supabase
      .from('posts')
      .update({ likes_count: (currentLikes || 0) + 1 })
      .eq('id', postId);

    if (error) {
      console.error('Error updating likes:', error.message);
    } else {
      // Refresh local state so the number updates instantly on screen
      setPosts((prev) => 
        prev.map((post) => 
          post.id === postId ? { ...post, likes_count: (post.likes_count || 0) + 1 } : post
        )
      );
    }
  };

  // 4. addPost function (kept your existing logic)
  const addPost = async (newPost: Omit<Post, 'id' | 'timestamp' | 'likes_count'>, file?: File) => {
    let finalImageUrl = newPost.imageUrl;

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(filePath, file);

      if (!uploadError) {
        const { data } = supabase.storage.from('post-images').getPublicUrl(filePath);
        finalImageUrl = data.publicUrl;
      }
    }

    const { data, error } = await supabase
      .from('posts')
      .insert([{ 
        content: newPost.content,
        type: newPost.type,
        tag: newPost.tag,
        imageUrl: finalImageUrl, 
        likes_count: 0, // Initialize new posts with 0 likes
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