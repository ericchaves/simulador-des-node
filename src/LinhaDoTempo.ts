import { IEntidade } from "./Entidade";

/**
 * Tipo para representar um evento na simulação.
 * @typedef
 */
export type Evento = {
  /**
   * Entidade que agendou o evento.
   * @type {string}
   */
    emissor: IEntidade;

  /**
   * Nome do evento.
   * @type {string}
   */
  nome: string;

  /**
   * Nome da entidade que o evento está associado.
   * @type {string}
   */
  entidade: string;

  /**
   * Quandiade de tempo para o evento ser disparado.
   * @type {number}
   */
  espera: number;

  /**
   * Argumentos adicionais para o evento.
   * @type {Record<string, any>[]}
   */
  argumentos: Record<string, any>[];
}

/**
 * Classe para representar a linha do tempo na simulação.
 * @class
 */
/**
 * Classe que representa uma linha do tempo para agendar e avançar eventos.
 */
export class LinhaDoTempo {
  private eventos: Map<number, Evento[]>;
  public timestampInicial: Date;
  public timestampAtual: Date;
  public intervalos: number;

  /**
   * Cria um nova linha do tempo iniciando na data informada e contando a partir do offset informado.
   * @constructor
   * @param {Date} dataInicial Data inicial da linha do tempo.
   * @param {number} deslocamentoInicial Quantidade de segundos transcorridos a partir da data inicial.
   */
  constructor(dataInicial: Date=new Date(), deslocamentoInicial: number=0) {
    this.eventos = new Map();
    this.timestampInicial = dataInicial;
    this.timestampAtual = new Date(dataInicial.getTime() + (deslocamentoInicial * 1000));
    this.intervalos = 0;
  }

  /**
   * Método para agendar um evento na linha do tempo.
   * @method
   * @param {Evento} evento Evento a ser agendado.
   * @returns {number} Retorna o momento (quantidade de segundos no futuro) em que o evento será disparado.
   */
  agendar(evento: Evento):number {
    const momento = this.momentoAtual + evento.espera;
    if(momento < 0){
      return -1;
    }
    const eventosDoMomento = this.eventos.get(momento) || [];
    eventosDoMomento.push(evento);
    this.eventos.set(momento, eventosDoMomento);
    return momento
  }

  /**
   * Método para retirar os próximos eventos da linha do tempo.
   * @method
   * @returns {Generator<Evento>} Retorna um gerador de eventos. Se não houver mais eventos, retorna um gerador vazio.
   */
  *avancarTempo(): Generator<Evento> {
    let momentoAnterior;
    while(this.eventos.size > 0){
      const momentoAtual = Math.min(...this.eventos.keys());
      const eventosAtuais = this.eventos.get(momentoAtual) || [];
      this.eventos.delete(momentoAtual);
      if (eventosAtuais) {
        this.timestampAtual = new Date(this.timestampInicial.getTime() + (momentoAtual * 1000));
        for (const evento of eventosAtuais) {
            yield evento;
        }
        if(momentoAnterior !== momentoAtual){
          this.intervalos++;
          momentoAnterior = momentoAtual;
        }
      }
    }
  }

  /**
   * Momento atual da linha do tempo, ou seja, a diferença de tempo em segundos entre a data inicial e a data atual.
   * @atribute
   */
  get momentoAtual(): number {
    return (this.timestampAtual.getTime() - this.timestampInicial.getTime()) / 1000;
  }
}