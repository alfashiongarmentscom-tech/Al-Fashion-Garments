'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setIsAuthorized(true);
      }
    };
    
    checkUser();

    // Listen for auth changes (like signing out or session expiry)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/login');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  if (!isAuthorized) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-black text-xs font-bold uppercase tracking-widest animate-pulse">
          Verifying Access...
        </p>
      </main>
    );
  }

  return <>{children}</>;
}