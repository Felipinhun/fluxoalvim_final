-- Criar tabela de agendamentos de consulta
CREATE TABLE public.agendamentos_consulta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT NOT NULL,
  data_nascimento DATE NOT NULL,
  cep TEXT NOT NULL,
  endereco TEXT NOT NULL,
  numero TEXT NOT NULL,
  complemento TEXT,
  bairro TEXT NOT NULL,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Criar tabela de agendamentos de retorno
CREATE TABLE public.agendamentos_retorno (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT NOT NULL,
  data_nascimento DATE NOT NULL,
  cep TEXT NOT NULL,
  endereco TEXT NOT NULL,
  numero TEXT NOT NULL,
  complemento TEXT,
  bairro TEXT NOT NULL,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Criar tabela de áudios enviados
CREATE TABLE public.audios_enviados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS em todas as tabelas
ALTER TABLE public.agendamentos_consulta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos_retorno ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audios_enviados ENABLE ROW LEVEL SECURITY;

-- Policies para agendamentos_consulta
CREATE POLICY "Usuários autenticados podem inserir seus próprios agendamentos"
ON public.agendamentos_consulta
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários autenticados podem visualizar todos os agendamentos"
ON public.agendamentos_consulta
FOR SELECT
TO authenticated
USING (true);

-- Policies para agendamentos_retorno
CREATE POLICY "Usuários autenticados podem inserir seus próprios retornos"
ON public.agendamentos_retorno
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários autenticados podem visualizar todos os retornos"
ON public.agendamentos_retorno
FOR SELECT
TO authenticated
USING (true);

-- Policies para audios_enviados
CREATE POLICY "Usuários autenticados podem inserir seus próprios áudios"
ON public.audios_enviados
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários autenticados podem visualizar todos os áudios"
ON public.audios_enviados
FOR SELECT
TO authenticated
USING (true);