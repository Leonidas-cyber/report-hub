import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type ServiceRole = 'publicador' | 'precursor_auxiliar' | 'precursor_regular';
type ReportStatus = 'pending' | 'reviewed' | 'edited';

interface ServiceReportDB {
  id: string;
  full_name: string;
  role: ServiceRole;
  hours: number | null;
  bible_courses: number | null;
  participated: boolean;
  superintendent_id: string | null;
  notes: string | null;
  month: string;
  year: number;
  status: ReportStatus;
  submitted_at: string;
  updated_at: string;
}

export interface ServiceReport {
  id: string;
  fullName: string;
  role: ServiceRole;
  hours?: number;
  bibleCourses?: number;
  participated: boolean;
  superintendentId: string;
  superintendentName: string;
  notes: string;
  month: string;
  year: number;
  status: ReportStatus;
  submittedAt: string;
}

export function useServiceReports() {
  const [reports, setReports] = useState<ServiceReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    const { data, error } = await supabase
      .from('service_reports')
      .select(`
        *,
        superintendents (
          id,
          name,
          group_number
        )
      `)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching reports:', error);
      return;
    }

    const transformedReports: ServiceReport[] = (data || []).map((report: ServiceReportDB & { superintendents: { id: string; name: string; group_number: number } | null }) => ({
      id: report.id,
      fullName: report.full_name,
      role: report.role,
      hours: report.hours ?? undefined,
      bibleCourses: report.bible_courses ?? undefined,
      participated: report.participated,
      superintendentId: report.superintendent_id || '',
      superintendentName: report.superintendents 
        ? `${report.superintendents.name} Grupo ${report.superintendents.group_number}` 
        : '',
      notes: report.notes || '',
      month: report.month,
      year: report.year,
      status: report.status,
      submittedAt: report.submitted_at,
    }));

    setReports(transformedReports);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReports();

    // Set up realtime subscription
    const channel = supabase
      .channel('service_reports_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_reports',
        },
        (_payload: RealtimePostgresChangesPayload<ServiceReportDB>) => {
          // Refetch all reports on any change
          fetchReports();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchReports]);

  const updateReport = async (id: string, updates: Partial<ServiceReport>) => {
    const dbUpdates: Partial<ServiceReportDB> = {};
    
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.role !== undefined) dbUpdates.role = updates.role;
    if (updates.hours !== undefined) dbUpdates.hours = updates.hours;
    if (updates.bibleCourses !== undefined) dbUpdates.bible_courses = updates.bibleCourses;
    if (updates.participated !== undefined) dbUpdates.participated = updates.participated;
    if (updates.superintendentId !== undefined) dbUpdates.superintendent_id = updates.superintendentId;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.status !== undefined) dbUpdates.status = updates.status;

    const { error } = await supabase
      .from('service_reports')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Error updating report:', error);
      throw error;
    }
  };

  const deleteReport = async (id: string) => {
    const { error } = await supabase
      .from('service_reports')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  };

  return { reports, loading, updateReport, deleteReport, refetch: fetchReports };
}
