import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FormularioAudio, Webhook } from '@/types';

const EnviarAudio = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormularioAudio>({
    nome: '',
    telefone: '+55',
    mensagem: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Buscar webhook do banco
      const { data: webhook, error } = await supabase
        .from('webhooks')
        .select('*')
        .eq('nome', 'enviar_audio')
        .single();

      if (error || !webhook) {
        throw new Error('Webhook não encontrado');
      }

      const webhookData = webhook as Webhook;

      // Construir URL com query params para GET
      const url = new URL(webhookData.url);
      url.searchParams.append('nome', formData.nome);
      url.searchParams.append('telefone', formData.telefone);
      url.searchParams.append('mensagem', formData.mensagem);

      // Enviar dados para o webhook
      const response = await fetch(url.toString(), {
        method: webhookData.metodo,
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar dados');
      }

      toast.success('Áudio enviado com sucesso!', {
        description: 'Sua mensagem foi recebida.',
      });

      // Limpar formulário
      setFormData({
        nome: '',
        telefone: '+55',
        mensagem: '',
      });
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao enviar áudio', {
        description: 'Por favor, tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout showBackButton>
      <Card className="shadow-lg">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-secondary/60 flex items-center justify-center">
            <Mic className="h-8 w-8 text-secondary-foreground" />
          </div>
          <CardTitle className="text-3xl">Enviar Áudio</CardTitle>
          <CardDescription className="text-base">
            Envie uma mensagem em áudio para o nutricionista
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Paciente</Label>
              <Input
                id="nome"
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Digite seu nome completo"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone com DDD</Label>
              <Input
                id="telefone"
                required
                type="tel"
                value={formData.telefone}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9+]/g, '');
                  setFormData({ ...formData, telefone: value });
                }}
                placeholder="+5511999999999"
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Formato: +55 seguido de DDD e número (apenas números)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mensagem">Mensagem</Label>
              <Textarea
                id="mensagem"
                required
                value={formData.mensagem}
                onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                placeholder="Digite sua mensagem aqui..."
                className="min-h-32 resize-none"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar Mensagem'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default EnviarAudio;
