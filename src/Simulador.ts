import { IEntidade } from './Entidade';
import { LinhaDoTempo, Evento } from './LinhaDoTempo';

/**
 * Classe para coordenar a simulação.
 * @class
 */
export default class Simulador {
  private linhaDoTempo: LinhaDoTempo;
  private entidades: Map<string, IEntidade[]> = new Map();
  private momentoInicial: number;
  private momentoFinal: number;
  private abortar: boolean = false;

  constructor(entidades: IEntidade[], momentoInicial: number, momentoFinal: number) {
    this.linhaDoTempo = new LinhaDoTempo();
    entidades.map(entidade => this.entidades.set(entidade.nome, [entidade]));
    this.momentoInicial = momentoInicial;
    this.momentoFinal = momentoFinal;
  }

  private async dispararEvento(evento: Evento): Promise<boolean> {
    const entidade = this.entidades.get(evento.entidade);
    if(entidade){
      return await entidade[0].processarEvento(
        evento.emissor, 
        evento.nome, 
        evento.argumentos, 
        this.linhaDoTempo.momentoAtual, 
        this.agendarEvento.bind(this)
      );
    }
    return false;
  }

  /**
   * Método para agendar um evento na linha do tempo.
   * @method
   * @param {string} nome Evento a ser agendado.
   */
  agendarEvento(emissor:IEntidade, nome: string,  entidade: string, argumentos: Record<string, any>[], espera: number = 1) {
    if(espera <= 0){
      this.dispararEvento({emissor, nome, entidade, argumentos, espera:0});
    }else{
      this.linhaDoTempo.agendar({emissor, nome, entidade, argumentos, espera});
    }
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
  async *simular(): AsyncGenerator<Number> {
    while (this.linhaDoTempo.momentoAtual < this.momentoFinal) {
      if(this.abortar){
        this.abortar = false;
        return;
      }
      for(const evento of this.linhaDoTempo.avancarTempo()){
        this.dispararEvento(evento); 
      }
      yield this.linhaDoTempo.momentoAtual;
    }
    return null;
  }

  /**
   * Método para abortar a simulação em execução.
   * @method
   */
  pararSimulacao() {
    this.abortar = true;
  }
}