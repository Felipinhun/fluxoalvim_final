export interface Webhook {
  id: number;
  nome: string;
  url: string;
  metodo: 'GET' | 'POST';
}

export interface Config {
  chave: string;
  valor: string;
}

export interface FormularioConsulta {
  nome: string;
  sobrenome: string;
  telefone: string;
  email: string;
  tipo_avaliacao: string;
  data: string;
  horario: string;
  observacao: string;
}

export interface FormularioAudio {
  nome: string;
  telefone: string;
  mensagem: string;
}
