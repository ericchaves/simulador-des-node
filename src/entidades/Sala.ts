import { IEntidade, Evento } from '../index';

export default class Sala implements IEntidade {
  nome: string;
  capacidadeMaxima: number = 2;
  pessoasNaSala: number = 0;
  agendarEvento: ((evento: Evento) => void ) | undefined;

  constructor(nome: string, capacidadeMaxima: number) {
    this.nome = nome;
    this.capacidadeMaxima = capacidadeMaxima || 2;
  }

  async inicializar(agendar: (evento: Evento) => void): Promise<boolean> {
    this.agendarEvento = agendar;
    return true;
  }

  async processarEvento(evento: string, argumentos: Record<string, any>[], momentoAtual: number): Promise<boolean> {
    const pessoa = argumentos[0].pessoa;
    console.log(`Sala processando evento ${evento} para ${pessoa}`);
    if (evento === 'entrar') {
      if (this.pessoasNaSala < this.capacidadeMaxima) {
        this.pessoasNaSala++;
        if(this.agendarEvento){
          this.agendarEvento({
            nome: 'sair',
            entidade: 'Sala',
            espera: 5,
            argumentos: [{ pessoa }],
          });
        }
        return true;
      } else {
        if(this.agendarEvento){
          this.agendarEvento({
            nome: 'aguardar',
            entidade: 'Pessoas',
            espera: 0,
            argumentos: [{ pessoa }]
          });
        }
      }
    } else if (evento === 'sair') {
      this.pessoasNaSala--;
      return true;
    }

    return false;
  }
}
