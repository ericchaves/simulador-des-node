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
  inicializar(agendar: Function): Promise<boolean>;

  /**
   * Método para processar um evento.
   * Recebe o nome do evento, os argumentos do evento e o valor do momentoAtual.
   * @method
   * @param {string} evento Nome do evento.
   * @param {Record<string, any>[]} argumentos Argumentos do evento.
   * @param {number} momentoAtual Valor do momento atual.
   * @returns {Promise<boolean>} Retorna true se o evento foi processado com sucesso, false caso contrário.
   */
  processarEvento(evento: string, argumentos: Record<string, any>[], momentoAtual: number): Promise<boolean>;
}