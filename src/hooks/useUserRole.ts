'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';

export const useUserRole = () => {
  const { data: session } = useSession();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!session?.user) {
        setUserRole(null);
        setIsLoading(false);
        return;
      }

      // First try to get role from session
      if (session.user.role) {
        setUserRole(session.user.role);
        setIsLoading(false);
        return;
      }

      // If role is not in session, fetch from API
      try {
        const response = await fetch('/api/user/role');
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.role || 'user');
        } else {
          setUserRole('user'); // Default fallback
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole('user'); // Default fallback
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [session]);

  return { userRole, isLoading };
};