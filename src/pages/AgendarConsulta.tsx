import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FormularioConsulta, Webhook } from '@/types';

const AgendarConsulta = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormularioConsulta>({
    nome: '',
    sobrenome: '',
    telefone: '+55',
    data: '',
    horario: '',
    observacao: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Buscar webhook do banco
      const { data: webhook, error } = await supabase
        .from('webhooks')
        .select('*')
        .eq('nome', 'agendar_consulta')
        .single();

      if (error || !webhook) {
        throw new Error('Webhook não encontrado');
      }

      const webhookData = webhook as Webhook;

      // Enviar dados para o webhook
      const response = await fetch(webhookData.url, {
        method: webhookData.metodo,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: formData.nome,
          sobrenome: formData.sobrenome,
          telefone: formData.telefone,
          data: formData.data,
          horario: formData.horario,
          observacao: formData.observacao,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar dados');
      }

      toast.success('Consulta enviada com sucesso!', {
        description: 'Em breve entraremos em contato.',
      });

      // Limpar formulário
      setFormData({
        nome: '',
        sobrenome: '',
        telefone: '+55',
        data: '',
        horario: '',
        observacao: '',
      });
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao enviar consulta', {
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
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">Agendar Consulta</CardTitle>
          <CardDescription className="text-base">
            Preencha os dados abaixo para agendar sua consulta nutricional
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Digite seu nome"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sobrenome">Sobrenome</Label>
                <Input
                  id="sobrenome"
                  required
                  value={formData.sobrenome}
                  onChange={(e) => setFormData({ ...formData, sobrenome: e.target.value })}
                  placeholder="Digite seu sobrenome"
                  className="h-11"
                />
              </div>
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

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="data">Data da Consulta</Label>
                <Input
                  id="data"
                  required
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="horario">Horário</Label>
                <Input
                  id="horario"
                  required
                  type="time"
                  value={formData.horario}
                  onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacao">Observação</Label>
              <Textarea
                id="observacao"
                value={formData.observacao}
                onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                placeholder="Adicione observações adicionais (opcional)"
                className="min-h-[100px]"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar Consulta'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default AgendarConsulta;
