import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, RotateCcw, Mic, Users, Clock } from 'lucide-react';
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

const Admin = () => {
  const [consultas, setConsultas] = useState<Agendamento[]>([]);
  const [retornos, setRetornos] = useState<Agendamento[]>([]);
  const [audios, setAudios] = useState<Audio[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalConsultas: 0,
    totalRetornos: 0,
    totalAudios: 0,
    today: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

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

      setConsultas(consultasData || []);
      setRetornos(retornosData || []);
      setAudios(audiosData || []);

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
        <Tabs defaultValue="consultas" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="consultas">
              <Calendar className="h-4 w-4 mr-2" />
              Consultas ({stats.totalConsultas})
            </TabsTrigger>
            <TabsTrigger value="retornos">
              <RotateCcw className="h-4 w-4 mr-2" />
              Retornos ({stats.totalRetornos})
            </TabsTrigger>
            <TabsTrigger value="audios">
              <Mic className="h-4 w-4 mr-2" />
              Mensagens ({stats.totalAudios})
            </TabsTrigger>
          </TabsList>

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
