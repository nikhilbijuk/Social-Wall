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
  // Updated addPost to accept an optional File object for the image upload
  addPost: (post: Omit<Post, 'id' | 'timestamp'>, file?: File) => Promise<void>;
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

  // 3. Updated addPost function for Real Image Uploads
  const addPost = async (newPost: Omit<Post, 'id' | 'timestamp'>, file?: File) => {
    let finalImageUrl = newPost.imageUrl;

    // A. If a physical file is provided, upload it to Supabase Storage
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('post-images') // Make sure this bucket exists and is PUBLIC
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload Error:', uploadError.message);
        // We continue with the post even if upload fails, or you can return
      } else {
        // B. Get the Public URL so it works on all devices
        const { data } = supabase.storage.from('post-images').getPublicUrl(filePath);
        finalImageUrl = data.publicUrl;
      }
    }

    // C. Final Database Insert with the actual cloud URL
    const { data, error } = await supabase
      .from('posts')
      .insert([{ 
        content: newPost.content,
        type: newPost.type,
        tag: newPost.tag,
        imageUrl: finalImageUrl, 
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