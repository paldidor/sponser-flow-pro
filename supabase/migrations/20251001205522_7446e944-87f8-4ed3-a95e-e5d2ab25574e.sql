-- Create activation_tasks table
CREATE TABLE IF NOT EXISTS public.activation_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  task_name text NOT NULL,
  due_date date NOT NULL,
  package_id uuid REFERENCES public.sponsorship_packages(id) ON DELETE CASCADE,
  sponsor_name text,
  description text,
  status text NOT NULL DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'stuck', 'complete')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activation_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for activation tasks
CREATE POLICY "Users can view their own activation tasks" 
ON public.activation_tasks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activation tasks" 
ON public.activation_tasks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activation tasks" 
ON public.activation_tasks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activation tasks" 
ON public.activation_tasks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_activation_tasks_updated_at
BEFORE UPDATE ON public.activation_tasks
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- Create index for performance
CREATE INDEX idx_activation_tasks_user_id ON public.activation_tasks(user_id);
CREATE INDEX idx_activation_tasks_status ON public.activation_tasks(status);
CREATE INDEX idx_activation_tasks_due_date ON public.activation_tasks(due_date);