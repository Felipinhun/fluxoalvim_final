import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, RotateCcw, Mic, Users, Clock, Settings, Webhook } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Agendamento {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  data_nascimento: string;
  created_at: string;
}

interface Audio {
  id: string;
  nome: string;
  telefone: string;
  audio_url: string;
  created_at: string;
}

interface Webhook {
  id: number;
  nome: string;
  url: string;
  metodo: string;
}

const Admin = () => {
  const [consultas, setConsultas] = useState<Agendamento[]>([]);
  const [retornos, setRetornos] = useState<Agendamento[]>([]);
  const [audios, setAudios] = useState<Audio[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [timezone, setTimezone] = useState('America/Sao_Paulo');
  const [currentTime, setCurrentTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalConsultas: 0,
    totalRetornos: 0,
    totalAudios: 0,
    today: 0,
  });

  useEffect(() => {
    loadData();
    updateCurrentTime();
    const timer = setInterval(updateCurrentTime, 1000);
    return () => clearInterval(timer);
  }, [timezone]);

  const updateCurrentTime = () => {
    const now = new Date();
    setCurrentTime(now.toLocaleString('pt-BR', { timeZone: timezone }));
  };

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar consultas
      const { data: consultasData, error: consultasError } = await supabase
        .from('agendamentos_consulta')
        .select('*')
        .order('created_at', { ascending: false });

      if (consultasError) throw consultasError;

      // Carregar retornos
      const { data: retornosData, error: retornosError } = await supabase
        .from('agendamentos_retorno')
        .select('*')
        .order('created_at', { ascending: false });

      if (retornosError) throw retornosError;

      // Carregar áudios
      const { data: audiosData, error: audiosError } = await supabase
        .from('audios_enviados')
        .select('*')
        .order('created_at', { ascending: false });

      if (audiosError) throw audiosError;

      // Carregar webhooks
      const { data: webhooksData, error: webhooksError } = await supabase
        .from('webhooks')
        .select('*')
        .order('id', { ascending: true });

      if (webhooksError) throw webhooksError;

      // Carregar configurações
      const { data: configData, error: configError } = await supabase
        .from('configs')
        .select('*')
        .eq('chave', 'timezone')
        .single();

      if (configError && configError.code !== 'PGRST116') throw configError;

      setConsultas(consultasData || []);
      setRetornos(retornosData || []);
      setAudios(audiosData || []);
      setWebhooks(webhooksData || []);
      if (configData) setTimezone(configData.valor);

      // Calcular estatísticas
      const today = new Date().toDateString();
      const todayCount = [
        ...(consultasData || []),
        ...(retornosData || []),
        ...(audiosData || []),
      ].filter(item => new Date(item.created_at).toDateString() === today).length;

      setStats({
        totalConsultas: consultasData?.length || 0,
        totalRetornos: retornosData?.length || 0,
        totalAudios: audiosData?.length || 0,
        today: todayCount,
      });

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const formatPhone = (phone: string) => {
    return phone.replace(/^\+55/, '');
  };

  const handleSaveTimezone = async () => {
    try {
      const { error } = await supabase
        .from('configs')
        .upsert({ chave: 'timezone', valor: timezone });

      if (error) throw error;
      toast.success('Fuso horário salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar fuso horário:', error);
      toast.error('Erro ao salvar fuso horário');
    }
  };

  const handleUpdateWebhook = async (id: number, field: 'url' | 'metodo', value: string) => {
    try {
      setWebhooks(webhooks.map(w => w.id === id ? { ...w, [field]: value } : w));
    } catch (error) {
      console.error('Erro ao atualizar webhook:', error);
    }
  };

  const handleSaveWebhooks = async () => {
    try {
      for (const webhook of webhooks) {
        const { error } = await supabase
          .from('webhooks')
          .update({ url: webhook.url, metodo: webhook.metodo })
          .eq('id', webhook.id);

        if (error) throw error;
      }
      toast.success('Webhooks salvos com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar webhooks:', error);
      toast.error('Erro ao salvar webhooks');
    }
  };

  const handleTestWebhook = async (webhook: Webhook) => {
    try {
      const response = await fetch(webhook.url, {
        method: webhook.metodo,
        headers: { 'Content-Type': 'application/json' },
        body: webhook.metodo === 'POST' ? JSON.stringify({ test: true }) : undefined,
      });

      if (response.ok) {
        toast.success(`Webhook "${webhook.nome}" testado com sucesso!`);
      } else {
        toast.error(`Erro ao testar webhook: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao testar webhook:', error);
      toast.error('Erro ao testar webhook');
    }
  };

  return (
    <Layout showBackButton>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              Dashboard Administrativo
            </CardTitle>
            <CardDescription>
              Visualize todos os agendamentos, retornos e mensagens
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Estatísticas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Consultas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.totalConsultas}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Retornos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{stats.totalRetornos}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Mensagens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{stats.totalAudios}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Hoje
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-muted-foreground">{stats.today}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabelas */}
        <Tabs defaultValue="configs" className="w-full">
          <div className="w-full overflow-x-auto">
            <TabsList className="inline-flex w-auto min-w-full">
              <TabsTrigger value="configs" className="flex-shrink-0">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </TabsTrigger>
              <TabsTrigger value="webhooks" className="flex-shrink-0">
                <Webhook className="h-4 w-4 mr-2" />
                Webhooks
              </TabsTrigger>
              <TabsTrigger value="consultas" className="flex-shrink-0">
                <Calendar className="h-4 w-4 mr-2" />
                Consultas ({stats.totalConsultas})
              </TabsTrigger>
              <TabsTrigger value="retornos" className="flex-shrink-0">
                <RotateCcw className="h-4 w-4 mr-2" />
                Retornos ({stats.totalRetornos})
              </TabsTrigger>
              <TabsTrigger value="audios" className="flex-shrink-0">
                <Mic className="h-4 w-4 mr-2" />
                Mensagens ({stats.totalAudios})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="configs">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
                <CardDescription>
                  Configure o fuso horário e outras preferências
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuso Horário</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">América/São Paulo (UTC-3)</SelectItem>
                      <SelectItem value="America/New_York">América/Nova York (UTC-5)</SelectItem>
                      <SelectItem value="Europe/London">Europa/Londres (UTC+0)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Ásia/Tóquio (UTC+9)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Horário Atual</Label>
                  <div className="text-2xl font-bold text-primary">{currentTime}</div>
                </div>
                <Button onClick={handleSaveTimezone}>Salvar Configurações</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhooks">
            <Card>
              <CardHeader>
                <CardTitle>Webhooks</CardTitle>
                <CardDescription>
                  Configure os webhooks para integração com sistemas externos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Carregando...</div>
                ) : webhooks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum webhook configurado
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome do Fluxo</TableHead>
                            <TableHead>URL do Webhook</TableHead>
                            <TableHead>Método</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {webhooks.map((webhook) => (
                            <TableRow key={webhook.id}>
                              <TableCell className="font-medium">{webhook.nome}</TableCell>
                              <TableCell>
                                <Input
                                  value={webhook.url}
                                  onChange={(e) => handleUpdateWebhook(webhook.id, 'url', e.target.value)}
                                  className="min-w-[300px]"
                                />
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={webhook.metodo}
                                  onValueChange={(value) => handleUpdateWebhook(webhook.id, 'metodo', value)}
                                >
                                  <SelectTrigger className="w-[100px]">
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
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleTestWebhook(webhook)}
                                >
                                  Testar
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <Button onClick={handleSaveWebhooks}>Salvar Alterações</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="consultas">
            <Card>
              <CardHeader>
                <CardTitle>Agendamentos de Consulta</CardTitle>
                <CardDescription>
                  Lista de todas as consultas agendadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Carregando...</div>
                ) : consultas.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma consulta agendada ainda
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Telefone</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Data Nascimento</TableHead>
                          <TableHead>Agendado em</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {consultas.map((consulta) => (
                          <TableRow key={consulta.id}>
                            <TableCell className="font-medium">{consulta.nome}</TableCell>
                            <TableCell>{formatPhone(consulta.telefone)}</TableCell>
                            <TableCell className="text-sm">{consulta.email}</TableCell>
                            <TableCell>{format(new Date(consulta.data_nascimento), 'dd/MM/yyyy')}</TableCell>
                            <TableCell className="text-sm">
                              <Badge variant="outline">{formatDate(consulta.created_at)}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="retornos">
            <Card>
              <CardHeader>
                <CardTitle>Agendamentos de Retorno</CardTitle>
                <CardDescription>
                  Lista de todos os retornos agendados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Carregando...</div>
                ) : retornos.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum retorno agendado ainda
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Telefone</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Data Nascimento</TableHead>
                          <TableHead>Agendado em</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {retornos.map((retorno) => (
                          <TableRow key={retorno.id}>
                            <TableCell className="font-medium">{retorno.nome}</TableCell>
                            <TableCell>{formatPhone(retorno.telefone)}</TableCell>
                            <TableCell className="text-sm">{retorno.email}</TableCell>
                            <TableCell>{format(new Date(retorno.data_nascimento), 'dd/MM/yyyy')}</TableCell>
                            <TableCell className="text-sm">
                              <Badge variant="outline">{formatDate(retorno.created_at)}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audios">
            <Card>
              <CardHeader>
                <CardTitle>Mensagens Enviadas</CardTitle>
                <CardDescription>
                  Lista de todas as mensagens recebidas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Carregando...</div>
                ) : audios.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma mensagem enviada ainda
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Telefone</TableHead>
                          <TableHead>Mensagem</TableHead>
                          <TableHead>Enviado em</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {audios.map((audio) => (
                          <TableRow key={audio.id}>
                            <TableCell className="font-medium">{audio.nome}</TableCell>
                            <TableCell>{formatPhone(audio.telefone)}</TableCell>
                            <TableCell className="max-w-md truncate text-sm">
                              {audio.audio_url}
                            </TableCell>
                            <TableCell className="text-sm">
                              <Badge variant="outline">{formatDate(audio.created_at)}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
