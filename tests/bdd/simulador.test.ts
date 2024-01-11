import Simulador, { Marco } from '../../src/Simulador';
import { IEntidade, AgendarEventoFunction } from '../../src/Entidade';

const mockEntidade: IEntidade = {
  nome: 'MockEntidade',
  inicializar: jest.fn().mockImplementation(async(agendarEvento: AgendarEventoFunction) => Promise.resolve(true)),
  processarEvento: jest.fn().mockImplementation((emissor: IEntidade, evento: string, argumentos: Record<string, any>[], momentoAtual: number, timestampAtual: Date, agendarEvento: AgendarEventoFunction) => Promise.resolve(true))
};

describe('Simulador', () => {
  let simulador: Simulador;
  let entidades: IEntidade[] = [mockEntidade];
  const dataInicioSimulacao = new Date('2020-01-01T00:00:00');

  beforeEach(() => {
    simulador = new Simulador(entidades, dataInicioSimulacao);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('ao chamar preparar as entidades devem ser inicializadas com sucesso.', async () => {
    const result = await simulador.preparar();
    expect(result).toBe(true);
    expect(mockEntidade.inicializar).toHaveBeenCalled();
  });

  test('ao executar simulacao deve emitir o valor do momento simulado a cada nova iteração de tempo com evento.', async () => {
    const result: Number[] = [];
    for(let i = 1; i <= 10; i++){
      simulador.agendarEvento(mockEntidade, `evento-${i}`, 'MockEntidade', [], i);
    }
    for await (const marco of simulador.simular()) {
      result.push(marco.momentoAtual);
    }
    expect(result).toEqual([0,1,2,3,4,5,6,7,8,9,10]);
  });

  test('ao pararSimulacao deve encerrar a simulacao sem avançar para o próximo momento.', async() => {
    const result: Number[] = [];
    for(let i = 1; i <= 10; i++){
      simulador.agendarEvento(mockEntidade, `evento-${i}`, 'MockEntidade', [], i);
    }
    for await (const marco of simulador.simular()) {
      result.push(marco.momentoAtual);
      if(result.length === 5){
        simulador.pararSimulacao();
      }
    }
    expect(result).toEqual([0,1,2,3,4]);
  });

  test('ao agendar um evento para uma entidade, o evento deve ser disparado durante a simulação.', async () => {
    simulador.agendarEvento(mockEntidade ,'teste', 'MockEntidade', [], 1);
    const result: Number[] = [];
    for await (const marco of simulador.simular()) {
      result.push(marco.momentoAtual);
    }
    expect(mockEntidade.processarEvento).toHaveBeenCalled();
  });

  test('ao disparar um evento deve informar timestampAtual e o momentoAtual do evento.', async () => {
    const horario = simulador.agendarEvento(mockEntidade ,'teste', 'MockEntidade', [], 1);
    for await (const _ of simulador.simular()) {
    }
    expect(mockEntidade.processarEvento).toHaveBeenCalledWith(
      mockEntidade, 
      'teste', 
      [], // Argumentos do evento
      1, // momentoAtual
      new Date(horario), // timestampAtual
      expect.any(Function) // agendarEvento
    );
  });

  test('deve emitir o marco antes da linha do tempo avançar o timestampAtual.', async () => {   
      const result: Marco[] = [];
      const timestamp_inicial = simulador.timestampAtual;
      const horario1 = simulador.agendarEvento(mockEntidade ,'evento0', 'MockEntidade', [], 0);
      const horario2 = simulador.agendarEvento(mockEntidade ,'evento1', 'MockEntidade', [], 1);
      for await (const marco of simulador.simular()) {
        result.push(marco);
      }
      // O marco deve ser emitido antes do timestampAtual avançar
      expect(mockEntidade.processarEvento).toHaveBeenCalledTimes(2);
      expect(result.length).toBe(2);
      // Verifica se o timestamp do Marco é igual ao horário do evento correspondente
      expect(result[0].timestampAtual.getTime()).toEqual(horario1);
      expect(result[1].timestampAtual.getTime()).toEqual(horario2);
  });

});