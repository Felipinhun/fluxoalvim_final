import { ReactNode, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings, Download, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface LayoutProps {
  children: ReactNode;
  showBackButton?: boolean;
  showAdminButton?: boolean;
}

export const Layout = ({ children, showBackButton = false, showAdminButton = false }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';
  const [showInstallButton, setShowInstallButton] = useState(false);
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    toast.success('Logout realizado com sucesso!');
    navigate('/login');
  };

  useEffect(() => {
    // Verificar se o app não está instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setShowInstallButton(!isStandalone);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="hover:bg-accent"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <img
              src="https://s3.alvimnutri.com.br/automacao/Public/Logo%20preta%20vertical%20sem%20fundo.png"
              alt="Alvim Automação"
              className="h-12 object-contain"
            />
          </div>
          <div className="flex gap-2">
            {showInstallButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/install')}
                className="rounded-full"
                title="Instalar App"
              >
                <Download className="h-5 w-5" />
              </Button>
            )}
            {showAdminButton && !isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin')}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Admin
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="rounded-full"
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {children}
      </main>
    </div>
  );
};
