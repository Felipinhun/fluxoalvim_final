-- Create webhooks table
CREATE TABLE public.webhooks (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  url TEXT NOT NULL,
  metodo TEXT NOT NULL CHECK (metodo IN ('GET', 'POST'))
);

-- Insert initial webhooks
INSERT INTO public.webhooks (id, nome, url, metodo) VALUES
  (1, 'agendar_consulta', 'https://webhook.alvimnutri.com.br/webhook/agendarconsulta', 'POST'),
  (2, 'agendar_retorno', 'https://webhook.alvimnutri.com.br/webhook/retorno', 'POST'),
  (3, 'enviar_audio', 'https://webhook.alvimnutri.com.br/webhook/enviaaudio', 'GET');

-- Create configs table
CREATE TABLE public.configs (
  chave TEXT PRIMARY KEY,
  valor TEXT NOT NULL
);

-- Insert initial config
INSERT INTO public.configs (chave, valor) VALUES
  ('timezone', 'America/Sao_Paulo');

-- Enable RLS but make tables publicly readable for this use case
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configs ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for forms to fetch webhook configs)
CREATE POLICY "Allow public read access to webhooks"
  ON public.webhooks
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to configs"
  ON public.configs
  FOR SELECT
  USING (true);

-- Allow public write access for admin functionality (we'll secure the admin page in the frontend)
CREATE POLICY "Allow public write access to webhooks"
  ON public.webhooks
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public write access to configs"
  ON public.configs
  FOR ALL
  USING (true)
  WITH CHECK (true);