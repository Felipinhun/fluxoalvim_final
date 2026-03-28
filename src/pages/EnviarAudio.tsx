import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PhoneInput } from '@/components/PhoneInput';
import { PatientSearch } from '@/components/PatientSearch';
import { Mic, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FormularioAudio, Webhook } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const EnviarAudio = () => {
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formData, setFormData] = useState<FormularioAudio>({
    nome: '',
    telefone: '+55',
    mensagem: '',
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

      // Salvar no banco de dados
      const { error: dbError } = await supabase
        .from('audios_enviados')
        .insert({
          user_id: user.id,
          nome: formData.nome,
          telefone: formData.telefone,
          audio_url: formData.mensagem, // Por enquanto salvando como texto
        });

      if (dbError) {
        throw dbError;
      }

      // Buscar webhook do banco
      const { data: webhook } = await supabase
        .from('webhooks')
        .select('*')
        .eq('nome', 'enviar_audio')
        .single();

      // Enviar para webhook se existir
      if (webhook) {
        const webhookData = webhook as Webhook;
        const url = new URL(webhookData.url);
        url.searchParams.append('nome', formData.nome);
        url.searchParams.append('telefone', formData.telefone);
        url.searchParams.append('mensagem', formData.mensagem);

        await fetch(url.toString(), {
          method: webhookData.metodo,
        }).catch(console.error);
      }

      toast.success('Mensagem enviada com sucesso!', {
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
      toast.error('Erro ao enviar mensagem', {
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
            <PatientSearch
              onSelect={(p) => setFormData({ ...formData, nome: `${p.nome} ${p.sobrenome}`, telefone: p.telefone })}
              onClear={() => setFormData({ ...formData, nome: '', telefone: '+55' })}
            />

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

            <PhoneInput
              value={formData.telefone}
              onChange={(value) => setFormData({ ...formData, telefone: value })}
              required
            />

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
              Revisar e Enviar
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mb-3">
              <CheckCircle2 className="h-6 w-6 text-secondary-foreground" />
            </div>
            <DialogTitle className="text-center text-2xl">Confirmar envio do áudio</DialogTitle>
            <DialogDescription className="text-center">
              Revise os dados antes de enviar
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-semibold text-muted-foreground">Nome:</div>
              <div className="text-foreground">{formData.nome}</div>
              
              <div className="font-semibold text-muted-foreground">Telefone:</div>
              <div className="text-foreground">{formData.telefone}</div>
            </div>
            
            <div className="pt-2 border-t">
              <div className="font-semibold text-muted-foreground text-sm mb-1">Mensagem:</div>
              <div className="text-sm text-foreground whitespace-pre-wrap">{formData.mensagem}</div>
            </div>
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

export default EnviarAudio;
