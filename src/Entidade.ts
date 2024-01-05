export type AgendarEventoFunction = (emissor: IEntidade, nome: string, entidade: string, argumentos: Record<string, any>[], espera: number) => void;

/**
 * Interface para representar uma entidade na simulação.
 * @interface
 */
export interface IEntidade {
  /**
   * Nome da entidade.
   * @type {string}
   */
  nome: string;

  /**
   * Método para inicializar a entidade.
   * Recebe um callback para agendar eventos.
   * @method
   * @param {Function} agendar Callback para agendar eventos.
   * @returns {Promise<boolean>} Retorna true se a inicialização foi bem-sucedida, false caso contrário.
   */
  inicializar(agendarEvento: AgendarEventoFunction): Promise<boolean>;

  /**
   * Método para processar um evento.
   * Recebe o nome do evento, os argumentos do evento e o valor do momentoAtual.
   * @method
   * @param {string} evento Nome do evento.
   * @param {IEntidade} emissor Entidade que agendou o evento.
   * @param {Record<string, any>[]} argumentos Argumentos do evento.
   * @param {number} momentoAtual Valor do momento atual.
   * @param {Date} timestampAtual Timestamp do momento atual em relação a dataInicial e escala da simulação.
   * @returns {Promise<boolean>} Retorna true se o evento foi processado com sucesso, false caso contrário.
   */
  processarEvento(emissor: IEntidade, evento: string, argumentos: Record<string, any>[], momentoAtual: number, timestampAtual: Date, agendarEvento: AgendarEventoFunction): Promise<boolean>;
}

export abstract class Entidade implements IEntidade {
  nome: string;

  constructor(nome: string) {
    this.nome = nome;
  }
  
  abstract inicializar(agendarEvento: AgendarEventoFunction): Promise<boolean>;

  abstract processarEvento(emissor: IEntidade, evento: string, argumentos: Record<string, any>[], momentoAtual: number, timestampAtual: Date, agendarEvento: AgendarEventoFunction): Promise<boolean>;
}