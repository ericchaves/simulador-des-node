import { IEntidade } from './Entidade';
import { LinhaDoTempo, Evento } from './LinhaDoTempo';

/**
 * Tipo para representar um marco de tempo na simulação.
 */
export type Marco = {
  /**
   * Valor do momento atual.
   */
  momento: number;
  /**
   * Timestamp do momento atual em relação a dataInicial e escala da simulação.
   */
  timestamp: Date;
  /**
   * Total de eventos disparados no momento atual.
   * @type {number}
   */
  totalEventos: number;
}

/**
 * Classe para coordenar a simulação.
 * @class
 */
export default class Simulador {
  private linhaDoTempo: LinhaDoTempo;
  private entidades: Map<string, IEntidade[]> = new Map();
  private abortar: boolean = false;
  public dataInicial: Date;

  constructor(entidades: IEntidade[], dataInicial: Date) {
    this.dataInicial = dataInicial;
    this.linhaDoTempo = new LinhaDoTempo(dataInicial);
    entidades.map(entidade => this.entidades.set(entidade.nome, [entidade]));
  }

  private async dispararEvento(evento: Evento): Promise<boolean> {
    const entidade = this.entidades.get(evento.entidade);
    if(entidade){
      return await entidade[0].processarEvento(
        evento.emissor, 
        evento.nome, 
        evento.argumentos,
        this.linhaDoTempo.momentoAtual,
        this.linhaDoTempo.timestampAtual,
        this.agendarEvento.bind(this)
      );
    }
    return false;
  }

  /**
   * Método para agendar um evento na linha do tempo.
   * @method
   * @param {string} nome Evento a ser agendado.
   * @returns {number} Retorna o momento do evento agendado.
   */
  agendarEvento(emissor:IEntidade, nome: string,  entidade: string, argumentos: Record<string, any>[], espera: number = 1):number {
    return this.linhaDoTempo.agendar({emissor, nome, entidade, argumentos, espera});
  }

  /**
   * Método para iniciar a simulação.
   * @method
   * @returns {Promise<boolean>} Retorna true se a inicialização foi bem-sucedida, false caso contrário.
   */
  async preparar(): Promise<boolean> {
    for (let [nome, entidade] of this.entidades) {
      const sucesso = await entidade[0].inicializar(this.agendarEvento.bind(this));
      if (!sucesso) {
        return false;
      }
    }
    return true;
  }

  /**
   * Método para simular a linha do tempo.
   * @method
   * @returns {AsyncGenerator<Marco>} Retorna um gerador de momentos.
   */
  async *simular(): AsyncGenerator<Marco> {
    let horarioAtual = this.linhaDoTempo.horarioAtual;      
    let totalEventos = 0;
    for(const evento of this.linhaDoTempo.avancarTempo()){
      if(this.abortar){
        this.abortar = false;
        return null;
      }
      await this.dispararEvento(evento);
      totalEventos++;
      if(horarioAtual !== this.linhaDoTempo.horarioAtual){
        const marco: Marco = { momento: this.linhaDoTempo.momentoAtual, timestamp: this.linhaDoTempo.timestampAtual, totalEventos } 
        horarioAtual = this.linhaDoTempo.horarioAtual;
        totalEventos = 0;
        yield marco;
      }
    }
  }

  /**
   * Método para abortar a simulação em execução.
   * @method
   */
  pararSimulacao() {
    this.abortar = true;
  }
}