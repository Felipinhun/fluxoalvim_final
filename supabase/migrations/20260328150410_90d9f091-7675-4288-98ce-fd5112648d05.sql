CREATE TABLE public.pacientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  sobrenome text NOT NULL,
  telefone text NOT NULL,
  email text,
  observacao text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to pacientes" ON public.pacientes FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert access to pacientes" ON public.pacientes FOR INSERT TO public WITH CHECK (true);