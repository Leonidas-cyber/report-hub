
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Superintendent {
  id: string;
  name: string;
  group_number: number;
}

export function useSuperintendents() {
  const [superintendents, setSuperintendents] = useState<Superintendent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSuperintendents = useCallback(async () => {
    const { data, error } = await supabase
      .from('superintendents')
      .select('*')
      .order('group_number');

    if (error) {
      console.error('Error fetching superintendents:', error);
    } else {
      setSuperintendents(data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSuperintendents();

    const channel = supabase
      .channel('superintendents_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'superintendents',
        },
        () => {
          fetchSuperintendents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSuperintendents]);

  return { superintendents, loading, refetch: fetchSuperintendents };
}
