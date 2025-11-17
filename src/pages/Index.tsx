import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, RotateCcw, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Agendar Consulta',
      description: 'Agende sua primeira consulta nutricional',
      icon: Calendar,
      path: '/agendar-consulta',
      gradient: 'from-primary/10 to-primary/5',
    },
    {
      title: 'Agendar Retorno',
      description: 'Marque seu retorno com o nutricionista',
      icon: RotateCcw,
      path: '/agendar-retorno',
      gradient: 'from-accent/30 to-accent/10',
    },
    {
      title: 'Enviar Áudio',
      description: 'Envie uma mensagem em áudio',
      icon: Mic,
      path: '/enviar-audio',
      gradient: 'from-secondary/40 to-secondary/20',
    },
  ];

  return (
    <Layout showAdminButton>
      <div className="space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-foreground tracking-tight">
            Área de Fluxos
          </h1>
          <p className="text-lg text-muted-foreground">
            Escolha uma das opções abaixo para continuar
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.path}
                className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2 hover:border-primary/30 bg-gradient-to-br"
                style={{
                  backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                }}
                onClick={() => navigate(card.path)}
              >
                <CardContent className="flex flex-col items-center text-center p-8 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">
                      {card.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {card.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Index;
