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
   * @type {Map<string, any>}
   */
  argumentos: Map<string, any>;
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
   * Método para agendar um evento na linha do tempo. Eventos agendados para o passado serão ignorados.
   * @method
   * @param {Evento} evento Evento a ser agendado.
   * @returns {number} Retorna o horario universal (time) em que o evento será disparado.
   */
  agendar(evento: Evento):number {
    const horarioEmSegs = this.horarioAtual + evento.espera ;
    if(horarioEmSegs >= this.horarioAtual){
      const eventosDoMomento = this.eventos.get(horarioEmSegs) || [];
      eventosDoMomento.push(evento);
      this.eventos.set(horarioEmSegs, eventosDoMomento);  
    }
    return horarioEmSegs * 1000;
  }

  /**
   * Método para retirar os próximos eventos da linha do tempo.
   * @method
   * @returns {Generator<Evento>} Retorna um gerador de eventos. Se não houver mais eventos, retorna um gerador vazio.
   */
  *avancarTempo(): Generator<Evento> {
    while(this.eventos.size > 0){
      const filtrados = [...this.eventos.keys()].filter(item => item >= this.horarioAtual);
      const horarioEmSegs = Math.min(...filtrados);
      const eventosAtuais = this.eventos.get(horarioEmSegs) || [];
      this.eventos.delete(horarioEmSegs);
      if (eventosAtuais) {
        if(this.horarioAtual !== horarioEmSegs){
          this.intervalos++;
          this.timestampAtual.setTime(horarioEmSegs * 1000);
        }
        for (const evento of eventosAtuais) {
            yield evento;
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

  /**
   * Retorna o timestamp atual da linha do tempo em segundos (Unix epoch com precisão de segundos apenas).
   * @atribute
   */
  get horarioAtual(): number {
    return Math.round(this.timestampAtual.getTime() / 1000);
  }
}