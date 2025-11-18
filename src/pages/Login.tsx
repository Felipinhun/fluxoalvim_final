import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignInFlo } from '@/components/ui/sign-in-flo';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (data: { 
    email: string; 
    password: string; 
    name?: string; 
    isSignUp: boolean 
  }) => {
    setIsLoading(true);

    try {
      if (data.isSignUp) {
        // Cadastro
        const { error } = await signUp(data.email, data.password);
        
        if (error) {
          toast.error('Erro ao criar conta', {
            description: error.message === 'User already registered' 
              ? 'Este email já está cadastrado' 
              : error.message,
          });
        } else {
          toast.success('Conta criada com sucesso!', {
            description: 'Você já pode fazer login'
          });
        }
      } else {
        // Login
        const { error } = await signIn(data.email, data.password);
        
        if (error) {
          toast.error('Erro ao fazer login', {
            description: error.message === 'Invalid login credentials' 
              ? 'Email ou senha incorretos' 
              : error.message,
          });
        } else {
          toast.success('Login realizado com sucesso!');
          navigate('/');
        }
      }
    } catch (error) {
      toast.error('Erro inesperado', {
        description: 'Tente novamente mais tarde'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return <SignInFlo onSubmit={handleSubmit} isSubmitting={isLoading} />;
}
