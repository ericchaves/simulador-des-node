/**
 * Tipo para representar um evento na simulação.
 * @typedef
 */
export type Evento = {
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