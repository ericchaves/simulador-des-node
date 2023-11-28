import { Evento } from './Evento';

/**
 * Classe para representar a linha do tempo na simulação.
 * @class
 */
export class LinhaDoTempo {
  private eventos: Map<number, Evento[]> = new Map();
  public momentoAtual: number = 0;

  /**
   * Método para agendar um evento na linha do tempo.
   * @method
   * @param {Evento} evento Evento a ser agendado.
   */
  agendar(evento: Evento) {
    const momento = this.momentoAtual + evento.espera;
    const eventosNoMomento = this.eventos.get(momento) || [];
    eventosNoMomento.push(evento);
    this.eventos.set(momento, eventosNoMomento);
  }

  /**
   * Método para retirar os próximos eventos da linha do tempo.
   * @method
   * @returns {Evento[]} Retorna um array de eventos. Se não houver mais eventos, retorna um array vazio.
   */
  retirarProximosEventos(): Evento[] {
    while (!this.eventos.has(this.momentoAtual) && this.eventos.size > 0) {
      this.momentoAtual++;
    }
    if (this.eventos.has(this.momentoAtual)) {
      const eventos = this.eventos.get(this.momentoAtual);
      if (eventos) {
        this.eventos.delete(this.momentoAtual);
        return eventos;
      }
    }
    return [];
  }
}