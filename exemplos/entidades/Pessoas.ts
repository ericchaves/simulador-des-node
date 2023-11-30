import { IEntidade, AgendarEventoFunction } from '../../src/';

export default class Pessoas implements IEntidade {
  nome: string;
  aguardando: Set<string> = new Set();
  naSala: Set<string> = new Set();

  constructor(nome: string) {
    this.nome = nome;
  }

  async inicializar(agendarEvento: AgendarEventoFunction): Promise<boolean> {
    console.log('Inicializando pessoas - agendando 5 eventos');
    for (let i = 1; i <= 5; i++) {
      let argumentos: Record<string, any>[] = [{pessoa :`pessoa_${i}`}];
      agendarEvento('entrar', 'sala', argumentos, 1);
    }
    return true;
  }

  async processarEvento(evento: string, argumentos: Record<string, any>[], momentoAtual: number, agendarEvento: AgendarEventoFunction): Promise<boolean> {
    const pessoa = argumentos[0].pessoa;
    console.log(`Pessoas: evento ${evento} recebido no momento ${momentoAtual} para ${pessoa}`);
    try{
      switch (evento) {
        case 'entrar':
          this.naSala.add(pessoa);
          return true;
        case 'sair':
          if (this.naSala.has(pessoa)){
            this.naSala.delete(pessoa);
          }
          if(this.aguardando.size > 0){
            const [proximaPessoa] = this.aguardando;
            this.aguardando.delete(proximaPessoa);
            agendarEvento('entrar', 'sala', [{ pessoa: proximaPessoa }], 2);
          }
          return true;
        case 'aguardar':
          this.aguardando.add(pessoa);
          return true;
        default:
          return false;
      }
    }finally{
      console.log(`Pessoas: aguardando: ${this.aguardando.size} na sala: ${this.naSala.size} `);
    }

  }
}
