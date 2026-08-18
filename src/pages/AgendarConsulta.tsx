import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PhoneInput } from '@/components/PhoneInput';
import { PatientSearch } from '@/components/PatientSearch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FormularioConsulta, Webhook } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const AgendarConsulta = () => {
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formData, setFormData] = useState<FormularioConsulta>({
    nome: '',
    sobrenome: '',
    telefone: '+55',
    email: '',
    tipo_avaliacao: '',
    data: '',
    horario: '',
    observacao: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    setLoading(true);
    setShowConfirmDialog(false);

    try {
      // Obter usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Salvar paciente no banco (upsert por telefone)
      await supabase.from('pacientes').upsert({
        nome: formData.nome,
        sobrenome: formData.sobrenome || null,
        telefone: formData.telefone,
        email: formData.email || null,
        observacao: formData.observacao || null,
      }, { onConflict: 'telefone' });

      // Salvar no banco de dados
      const { error: dbError } = await supabase
        .from('agendamentos_consulta')
        .insert({
          user_id: user.id,
          nome: `${formData.nome} ${formData.sobrenome}`,
          telefone: formData.telefone,
          email: formData.email || user.email || '',
          data_nascimento: formData.data,
          cep: '',
          endereco: '',
          numero: '',
          bairro: '',
          cidade: '',
          estado: '',
        });

      if (dbError) {
        throw dbError;
      }

      // Buscar webhook do banco
      const { data: webhook } = await supabase
        .from('webhooks')
        .select('*')
        .eq('nome', 'agendar_consulta')
        .single();

      // Enviar para webhook se existir
      if (webhook) {
        const webhookData = webhook as Webhook;
        await fetch(webhookData.url, {
          method: webhookData.metodo,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nome: formData.nome,
            sobrenome: formData.sobrenome,
            telefone: formData.telefone,
            email: formData.email,
            tipo_avaliacao: formData.tipo_avaliacao,
            data: formData.data,
            horario: formData.horario,
            observacao: formData.observacao,
          }),
        }).catch(console.error);
      }

      toast.success('Consulta agendada com sucesso!', {
        description: 'Em breve entraremos em contato.',
      });

      // Limpar formulário
      setFormData({
        nome: '',
        sobrenome: '',
        telefone: '+55',
        email: '',
        tipo_avaliacao: '',
        data: '',
        horario: '',
        observacao: '',
      });
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao agendar consulta', {
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
            <PatientSearch
              onSelect={(p) =>
                setFormData({
                  ...formData,
                  nome: p.nome,
                  sobrenome: p.sobrenome || '',
                  telefone: p.telefone,
                  email: p.email || formData.email,
                })
              }
              onClear={() =>
                setFormData({
                  ...formData,
                  nome: '',
                  sobrenome: '',
                  telefone: '+55',
                  email: '',
                  tipo_avaliacao: '',
                  observacao: '',
                })
              }
            />

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

            <div className="grid gap-6 md:grid-cols-2">
              <PhoneInput
                value={formData.telefone}
                onChange={(value) => setFormData({ ...formData, telefone: value })}
                required
              />
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="exemplo@email.com"
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_avaliacao">Tipo de Avaliação</Label>
              <Select
                value={formData.tipo_avaliacao}
                onValueChange={(value) => setFormData({ ...formData, tipo_avaliacao: value })}
              >
                <SelectTrigger id="tipo_avaliacao" className="h-11">
                  <SelectValue placeholder="Selecione o tipo de avaliação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dobras">Dobras</SelectItem>
                  <SelectItem value="Bioimpedância">Bioimpedância</SelectItem>
                  <SelectItem value="Ambos">Ambos</SelectItem>
                  <SelectItem value="A definir">A definir</SelectItem>
                </SelectContent>
              </Select>
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
              Revisar e Enviar
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-center text-2xl">Confirmar dados da consulta</DialogTitle>
            <DialogDescription className="text-center">
              Revise os dados antes de enviar
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-semibold text-muted-foreground">Nome:</div>
              <div className="text-foreground">{formData.nome} {formData.sobrenome}</div>
              
              <div className="font-semibold text-muted-foreground">Telefone:</div>
              <div className="text-foreground">{formData.telefone}</div>

              {formData.email && (
                <>
                  <div className="font-semibold text-muted-foreground">Email:</div>
                  <div className="text-foreground">{formData.email}</div>
                </>
              )}

              {formData.tipo_avaliacao && (
                <>
                  <div className="font-semibold text-muted-foreground">Tipo de Avaliação:</div>
                  <div className="text-foreground">{formData.tipo_avaliacao}</div>
                </>
              )}
              
              <div className="font-semibold text-muted-foreground">Data:</div>
              <div className="text-foreground">{formData.data ? new Date(formData.data + 'T00:00:00').toLocaleDateString('pt-BR') : ''}</div>
              
              <div className="font-semibold text-muted-foreground">Horário:</div>
              <div className="text-foreground">{formData.horario}</div>
            </div>
            
            {formData.observacao && (
              <div className="pt-2 border-t">
                <div className="font-semibold text-muted-foreground text-sm mb-1">Observação:</div>
                <div className="text-sm text-foreground">{formData.observacao}</div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={loading}
            >
              Editar
            </Button>
            <Button
              onClick={handleConfirmSubmit}
              disabled={loading}
              className="font-semibold"
            >
              {loading ? 'Enviando...' : 'Confirmar e Enviar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default AgendarConsulta;
