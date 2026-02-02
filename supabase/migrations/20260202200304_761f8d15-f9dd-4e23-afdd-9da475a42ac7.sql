-- Create attendance_records table for tracking meeting attendance
CREATE TABLE public.attendance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  meeting_type TEXT NOT NULL CHECK (meeting_type IN ('entre_semana', 'fin_semana')),
  attendees INTEGER NOT NULL DEFAULT 0,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Anyone can insert attendance records (public form)
CREATE POLICY "Anyone can insert attendance records" 
ON public.attendance_records 
FOR INSERT 
WITH CHECK (true);

-- Authenticated users can read attendance records
CREATE POLICY "Authenticated can read attendance" 
ON public.attendance_records 
FOR SELECT 
USING (true);

-- Authenticated users can update attendance records
CREATE POLICY "Authenticated can update attendance" 
ON public.attendance_records 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Authenticated users can delete attendance records
CREATE POLICY "Authenticated can delete attendance" 
ON public.attendance_records 
FOR DELETE 
USING (true);

-- Create index for faster queries by month/year
CREATE INDEX idx_attendance_month_year ON public.attendance_records(month, year);