import { IEntidade } from './IEntidade';
import { Evento } from './Evento';
import { LinhaDoTempo } from './LinhaDoTempo';

/**
 * Tipo para representar um momento na simulação.
 * @typedef
 */
export type Momentos = {
  momento: number;
  eventosProcessados: number;
  eventosNaoProcessados: number;
};

/**
 * Classe para coordenar a simulação.
 * @class
 */
export class Simulador {
  private linhaDoTempo: LinhaDoTempo;
  private entidades: IEntidade[];
  private momentoInicial: number;
  private momentoFinal: number;

  constructor(entidades: IEntidade[], momentoInicial: number, momentoFinal: number) {
    this.linhaDoTempo = new LinhaDoTempo();
    this.entidades = entidades;
    this.momentoInicial = momentoInicial;
    this.momentoFinal = momentoFinal;
  }

  /**
   * Método para agendar um evento na linha do tempo.
   * @method
   * @param {Evento} evento Evento a ser agendado.
   */
  agendar(evento: Evento) {
    this.linhaDoTempo.agendar(evento);
  }

  /**
   * Método para iniciar a simulação.
   * @method
   * @returns {Promise<boolean>} Retorna true se a inicialização foi bem-sucedida, false caso contrário.
   */
  async iniciar(): Promise<boolean> {
    for (let entidade of this.entidades) {
      const sucesso = await entidade.inicializar(this.agendar.bind(this));
      if (!sucesso) {
        return false;
      }
    }
    return true;
  }

  /**
   * Método para simular a linha do tempo.
   * @method
   * @returns {AsyncGenerator<Momentos>} Retorna um gerador de momentos.
   */
  async *simular(): AsyncGenerator<Momentos> {
    while (this.linhaDoTempo.momentoAtual <= this.momentoFinal) {
      const eventos = this.linhaDoTempo.retirarProximosEventos();
      if (eventos && this.linhaDoTempo.momentoAtual >= this.momentoInicial) {
        let eventosProcessados = 0;
        let eventosNaoProcessados = 0;
        for (let evento of eventos) {
          for (let entidade of this.entidades) {
            const sucesso = await entidade.processarEvento(evento.nome, evento.argumentos, this.linhaDoTempo.momentoAtual);
            if (sucesso) {
              eventosProcessados++;
            } else {
              eventosNaoProcessados++;
            }
          }
        }
        yield { momento: this.linhaDoTempo.momentoAtual, eventosProcessados, eventosNaoProcessados };
      }
    }
    return null;
  }

}