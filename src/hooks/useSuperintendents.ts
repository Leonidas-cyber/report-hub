import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Superintendent {
  id: string;
  name: string;
  group_number: number;
}

export function useSuperintendents() {
  const [superintendents, setSuperintendents] = useState<Superintendent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuperintendents = async () => {
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
    };

    fetchSuperintendents();
  }, []);

  return { superintendents, loading };
}
