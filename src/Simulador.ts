import { IEntidade } from './Entidade';
import { LinhaDoTempo, Evento } from './LinhaDoTempo';

/**
 * Tipo para representar um marco de tempo na simulação.
 */
export type Marco = {
  /**
   * Valor do momento atual.
   */
  momentoAtual: number;
  /**
   * Timestamp do momento atual em relação a dataInicial e escala da simulação.
   */
  timestampAtual: Date;
  /**
   * Total de eventos processados no momento atual.
   * @type {number}
   */
  eventosProcessados: number;

  /**
   * Total de eventos ignorados no momento atual.
   * @type {number}
   */
  eventosIgnorados: number;
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

  public get timestampAtual(): Date {
    return new Date(this.linhaDoTempo.timestampAtual.getTime());
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
    let momentoAtual = this.linhaDoTempo.momentoAtual;
    let eventosProcessados = 0;
    let eventosIgnorados = 0;
    let continuar = true;
    while(continuar){
      const timestampAtual = this.linhaDoTempo.timestampAtual;
      for(const evento of this.linhaDoTempo.emitirEventos()){
        if(this.abortar){
          this.abortar = false;
          return null;
        }
        const processado = await this.dispararEvento(evento);
        if(processado) {
          eventosProcessados++
        }else{
          eventosIgnorados++;
        }
      }
      continuar = this.linhaDoTempo.avancarTempo();
      if(momentoAtual !== this.linhaDoTempo.momentoAtual){
        const marco: Marco = {  
          momentoAtual, 
          timestampAtual, 
          eventosProcessados,
          eventosIgnorados, 
        }; 
        yield marco;
        momentoAtual = this.linhaDoTempo.momentoAtual;
      }
     };
     // yield do último marco
     const marco: Marco = {  
      momentoAtual: this.linhaDoTempo.momentoAtual, 
      timestampAtual: this.linhaDoTempo.timestampAtual, 
      eventosProcessados,
      eventosIgnorados, 
    }; 
    yield marco;
  }
    

  /**
   * Método para abortar a simulação em execução.
   * @method
   */
  pararSimulacao() {
    this.abortar = true;
  }
}