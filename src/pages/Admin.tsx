import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Settings, Save, TestTube2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Webhook, Config } from '@/types';

const Admin = () => {
  const [timezone, setTimezone] = useState('America/Sao_Paulo');
  const [currentTime, setCurrentTime] = useState('');
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  const loadData = async () => {
    try {
      // Carregar timezone
      const { data: configData } = await supabase
        .from('configs')
        .select('*')
        .eq('chave', 'timezone')
        .single();

      if (configData) {
        const config = configData as Config;
        setTimezone(config.valor);
      }

      // Carregar webhooks
      const { data: webhooksData } = await supabase
        .from('webhooks')
        .select('*')
        .order('id');

      if (webhooksData) {
        setWebhooks(webhooksData as Webhook[]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar configurações');
    }
  };

  const updateCurrentTime = () => {
    const now = new Date();
    const timeString = now.toLocaleString('pt-BR', {
      timeZone: timezone,
      dateStyle: 'short',
      timeStyle: 'medium',
    });
    setCurrentTime(timeString);
  };

  const handleSaveTimezone = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('configs')
        .update({ valor: timezone })
        .eq('chave', 'timezone');

      if (error) throw error;

      toast.success('Fuso horário salvo com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao salvar fuso horário');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWebhook = async (id: number, field: 'url' | 'metodo', value: string) => {
    const updatedWebhooks = webhooks.map((w) =>
      w.id === id ? { ...w, [field]: value } : w
    );
    setWebhooks(updatedWebhooks);
  };

  const handleSaveWebhooks = async () => {
    setLoading(true);
    try {
      for (const webhook of webhooks) {
        const { error } = await supabase
          .from('webhooks')
          .update({
            url: webhook.url,
            metodo: webhook.metodo,
          })
          .eq('id', webhook.id);

        if (error) throw error;
      }

      toast.success('Webhooks salvos com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao salvar webhooks');
    } finally {
      setLoading(false);
    }
  };

  const handleTestWebhook = async (webhook: Webhook) => {
    try {
      toast.info(`Testando webhook: ${webhook.nome}`);
      
      let response;
      if (webhook.metodo === 'GET') {
        response = await fetch(webhook.url);
      } else {
        response = await fetch(webhook.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teste: true }),
        });
      }

      if (response.ok) {
        toast.success(`Webhook "${webhook.nome}" funcionando!`, {
          description: `Status: ${response.status}`,
        });
      } else {
        toast.warning(`Webhook respondeu com status ${response.status}`);
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error(`Erro ao testar webhook "${webhook.nome}"`);
    }
  };

  return (
    <Layout showBackButton>
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Settings className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Painel Administrativo</h1>
          <p className="text-lg text-muted-foreground">
            Configure o sistema e gerencie webhooks
          </p>
        </div>

        {/* Configurações do Sistema */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Configurações do Sistema</CardTitle>
            <CardDescription>Gerencie as configurações globais do aplicativo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="timezone">Fuso Horário</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="timezone" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Sao_Paulo">America/Sao_Paulo (Brasil)</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (EUA)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (Reino Unido)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Horário atual no fuso selecionado:
              </p>
              <p className="text-2xl font-bold text-foreground">{currentTime}</p>
            </div>

            <Button onClick={handleSaveTimezone} disabled={loading} className="gap-2">
              <Save className="h-4 w-4" />
              Salvar Fuso Horário
            </Button>
          </CardContent>
        </Card>

        {/* Gerenciamento de Webhooks */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Webhooks</CardTitle>
            <CardDescription>Configure as URLs e métodos dos webhooks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Nome do Fluxo</TableHead>
                    <TableHead>URL do Webhook</TableHead>
                    <TableHead className="w-[120px]">Método</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.map((webhook) => (
                    <TableRow key={webhook.id}>
                      <TableCell className="font-medium">{webhook.nome}</TableCell>
                      <TableCell>
                        <Input
                          value={webhook.url}
                          onChange={(e) =>
                            handleUpdateWebhook(webhook.id, 'url', e.target.value)
                          }
                          className="h-9"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={webhook.metodo}
                          onValueChange={(value) =>
                            handleUpdateWebhook(webhook.id, 'metodo', value)
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GET">GET</SelectItem>
                            <SelectItem value="POST">POST</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTestWebhook(webhook)}
                          className="gap-1 h-9"
                        >
                          <TestTube2 className="h-3 w-3" />
                          Testar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Button onClick={handleSaveWebhooks} disabled={loading} className="gap-2">
              <Save className="h-4 w-4" />
              Salvar Alterações
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Admin;
