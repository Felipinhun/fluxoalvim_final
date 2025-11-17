import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, Download, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Capturar o evento de instalação
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      toast.error('Instalação não disponível', {
        description: 'Use o menu do navegador para adicionar à tela inicial',
      });
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      toast.success('App instalado com sucesso!');
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return (
    <Layout showBackButton>
      <Card className="shadow-lg">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Smartphone className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">Instalar Aplicativo</CardTitle>
          <CardDescription className="text-base">
            {isInstalled
              ? 'O app já está instalado no seu dispositivo!'
              : 'Instale o app na tela inicial do seu celular'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isInstalled ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">App instalado</h3>
                <p className="text-muted-foreground">
                  Você já pode usar o aplicativo offline e acessá-lo pela tela inicial.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Vantagens do app instalado:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Acesso rápido direto da tela inicial
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Funciona offline após a primeira visita
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Carregamento mais rápido
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Visual de app nativo sem barra do navegador
                    </span>
                  </li>
                </ul>
              </div>

              {isInstallable ? (
                <Button
                  onClick={handleInstall}
                  className="w-full h-12 text-base font-semibold"
                  size="lg"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Instalar Agora
                </Button>
              ) : (
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <p className="font-semibold">Como instalar manualmente:</p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>
                      <strong>No iPhone:</strong> Toque no botão "Compartilhar" 
                      <span className="inline-block mx-1">↗️</span> 
                      e depois em "Adicionar à Tela de Início"
                    </p>
                    <p>
                      <strong>No Android:</strong> Toque no menu do navegador (⋮) 
                      e selecione "Adicionar à tela inicial" ou "Instalar app"
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
};

export default Install;
