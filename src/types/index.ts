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
  data: string;
  horario: string;
}

export interface FormularioAudio {
  nome: string;
  telefone: string;
  mensagem: string;
}
