import { IEntidade, Evento } from '../index';

export default class Pessoas implements IEntidade {
  nome: string;
  aguardando: string[] = [];
  naSala: string[] = [];
  agendarEvento: ((evento: Evento) => void) | undefined;

  constructor(nome: string) {
    this.nome = nome;
  }

  async inicializar(agendar: (evento: Evento) => void): Promise<boolean> {
    this.agendarEvento = agendar;
    for (let i = 1; i <= 5; i++) {
      let argumentos: Record<string, any>[] = [{pessoa :`pessoa_${i}`}];
      this.agendarEvento({
        nome: 'entrar',
        entidade: 'Sala',
        argumentos,
        espera: 0,
      });
    }
    return true;
  }

  async processarEvento(evento: string, argumentos: Record<string, any>[], momentoAtual: number): Promise<boolean> {
    const pessoa = argumentos[0].pessoa;
    console.log(`Pessoa ${pessoa} processando evento ${evento}`);
    if (evento === 'entrar') {
      this.naSala.push(pessoa);
      return true;
    } else if (evento === 'sair') {
      this.naSala = this.naSala.filter(p => p !== pessoa);
      if (this.aguardando.length > 0) {
        const proximaPessoa = this.aguardando.shift()!;
        if(this.agendarEvento){
          this.agendarEvento({
            nome: 'entrar',
            entidade: 'Sala',
            espera: 1,
            argumentos: [{ pessoa: proximaPessoa }]
          });
        }
      }
      return true;
    } else if (evento === 'aguardar') {
      this.aguardando.push(pessoa);
    }

    return false;
  }
}
