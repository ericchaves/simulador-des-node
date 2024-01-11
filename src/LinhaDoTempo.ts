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
  public intervalos: number;
  private _timestampInicial: Date;
  private _timestampAtual: Date;

  /**
   * Cria um nova linha do tempo iniciando na data informada e contando a partir do offset informado.
   * @constructor
   * @param {Date} dataInicial Data inicial da linha do tempo.
   * @param {number} deslocamentoInicial Quantidade de segundos transcorridos a partir da data inicial.
   */
  constructor(dataInicial: Date=new Date(), deslocamentoInicial: number=0) {
    this.eventos = new Map();
    this._timestampInicial = dataInicial;
    this._timestampAtual = new Date(dataInicial.getTime() + (deslocamentoInicial * 1000));
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
   * tenta avança a linha do tempo para a próxima marca de eventos.
   * @method
   * @returns {Boolean} Retorna false se não houver mais eventos futuros.
   */
  avancarTempo(): boolean {
    const horariosFuturos = [...this.eventos.keys()].filter(horario => horario > this.horarioAtual);
    if (horariosFuturos.length === 0) {
      return false; // Não há mais horários futuros no array de eventos
    }
    const proximoHorario = Math.min(...horariosFuturos);
    this._timestampAtual.setTime(proximoHorario * 1000);
    return true;
  }


  /**
   * Método para emitir os eventos do momento atual.
   * @method
   * @returns {Generator<Evento>} Retorna um gerador de eventos.
   */
  *emitirEventos(): Generator<Evento> {
    const eventosAtuais = this.eventos.get(this.horarioAtual) || [];
    for (const evento of eventosAtuais) {
      yield evento;
    }
  }

  /**
   * Momento atual da linha do tempo, ou seja, a diferença de tempo em segundos entre a data inicial e a data atual.
   * @atribute
   */
  get momentoAtual(): number {
    return (this._timestampAtual.getTime() - this._timestampInicial.getTime()) / 1000;
  }

  get timestampAtual(): Date {
    return new Date(this._timestampAtual.getTime());
  };

  get timestampInicial(): Date {
    return new Date(this._timestampInicial.getTime());
  };

  /**
   * Retorna o tempo atual da linha do tempo em segundos (Unix epoch com precisão de segundos apenas).
   * @atribute
   */
  get horarioAtual(): number {
    return Math.round(this._timestampAtual.getTime() / 1000);
  }
}