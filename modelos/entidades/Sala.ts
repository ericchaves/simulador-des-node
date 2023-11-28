import { IEntidade, AgendarEventoFunction } from '../../src/';

export default class Sala implements IEntidade {
  nome: string;
  capacidadeMaxima: number = 2;
  pessoasNaSala: number = 0;

  constructor(nome: string, capacidadeMaxima: number) {
    this.nome = nome;
    this.capacidadeMaxima = capacidadeMaxima || 2;
  }

  async inicializar(agendarEvento: AgendarEventoFunction): Promise<boolean> {
    console.log('Inicializando sala - agendando 0 eventos');
    return true;
  }

  async processarEvento(evento: string, argumentos: Record<string, any>[], momentoAtual: number, agendarEvento: AgendarEventoFunction): Promise<boolean> {
    const pessoa = argumentos[0].pessoa;
    try{
      switch (evento) {
      case 'entrar':
        if (this.pessoasNaSala < this.capacidadeMaxima) {
          this.pessoasNaSala++;
          agendarEvento('entrar', 'pessoas', [{ pessoa }], 0);
          agendarEvento('sair', 'pessoas', [{ pessoa }], 2);
        } else {
          agendarEvento('aguardar', 'pessoas', [{ pessoa }], 0);
        }
        return true;
      case 'sair':
        this.pessoasNaSala--;
        return true;
      default:
        return false;
      }
    }finally{
      console.log(`Sala: ${this.pessoasNaSala} pessoas na sala no momento ${momentoAtual}`); 
    }
  }
}
