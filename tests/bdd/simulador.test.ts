import Simulador from '../../src/Simulador';
import { IEntidade, AgendarEventoFunction } from '../../src/Entidade';

const mockEntidade: IEntidade = {
  nome: 'MockEntidade',
  inicializar: jest.fn().mockImplementation((agendarEvento: AgendarEventoFunction) => Promise.resolve(true)),
  processarEvento: jest.fn().mockImplementation((emissor: IEntidade, evento: string, argumentos: Record<string, any>[], momentoAtual: number, timestampAtual: Date, agendarEvento: AgendarEventoFunction) => Promise.resolve(true))
};

describe('Simulador', () => {
  let entidades: IEntidade[] = [mockEntidade];
  const dataInicioSimulacao = new Date('2020-01-01T00:00:00');
  const dataFimSimulacao    = new Date('2020-01-01T00:00:10');
  const dataFimSimulacao2   = new Date('2020-01-01T01:00:00');

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('ao chamar preparar as entidades devem ser inicializadas com sucesso.', async () => {
    const simulador = new Simulador(entidades, dataInicioSimulacao, dataFimSimulacao);
    const result = await simulador.preparar();
    expect(result).toBe(true);
    expect(mockEntidade.inicializar).toHaveBeenCalled();
  });

  test('ao executar simular deve emitir o valor do momento simulado a cada iteração.', async () => {
    const simulador = new Simulador(entidades, dataInicioSimulacao, dataFimSimulacao);
    const result: Number[] = [];
    for await (const marco of simulador.simular()) {
      result.push(marco.momento);
    }
    expect(result).toEqual([1,2,3,4,5,6,7,8,9,10]);
  });

  test('ao pararSimulacao deve encerrar a simulacao sem avançar para o próximo momento.', async() => {
    const simulador = new Simulador(entidades, dataInicioSimulacao, dataFimSimulacao);
    const result: Number[] = [];
    for await (const marco of simulador.simular()) {
      result.push(marco.momento);
      if(result.length === 5){
        simulador.pararSimulacao();
      }
    }
    expect(result).toEqual([1,2,3,4,5]);
  });

  test('ao agendar um evento para uma entidade, o evento deve ser disparado durante a simulação.', async () => {
    const simulador = new Simulador(entidades, dataInicioSimulacao, dataFimSimulacao);
    simulador.agendarEvento(mockEntidade ,'teste', 'MockEntidade', [], 1);
    const result: Number[] = [];
    for await (const marco of simulador.simular()) {
      result.push(marco.momento);
    }
    expect(mockEntidade.processarEvento).toHaveBeenCalled();
  });

  test('ao executar uma simulação de uma hora com escala de 1 minuto deve disparar 60 eventos', async () => {
    const simulador = new Simulador(entidades, dataInicioSimulacao, dataFimSimulacao2, 60);
    const result: Number[] = [];
    for await (const marco of simulador.simular()) {
      result.push(marco.momento);
    }
    expect(result).toHaveLength(60);
  });  

  test('ao disparar um evento deve informar timestampAtual e o momentoAtual do evento.', async () => {
    const simulador = new Simulador(entidades, dataInicioSimulacao, dataFimSimulacao2, 60);
    simulador.agendarEvento(mockEntidade ,'teste', 'MockEntidade', [], 1);
    for await (const _ of simulador.simular()) {
    }
    expect(mockEntidade.processarEvento).toHaveBeenCalledWith(
      mockEntidade, 
      'teste', 
      [], // Argumentos do evento
      1, // momentoAtual
      new Date('2020-01-01 00:01:00'), // timestampAtual
      expect.any(Function) // agendarEvento
    );
  });

  test('ao processar cada momento, deve emitir um marco de tempo com o momento e timestamp', async () => {
    const simulador = new Simulador(entidades, dataInicioSimulacao, dataFimSimulacao);
    const result: { momento: number, timestamp: Date }[] = [];
    for await (const marco of simulador.simular()) {
      result.push({ momento: marco.momento, timestamp: marco.timestamp });
    }
    expect(result).toHaveLength(10);
    expect(result[0]).toEqual({ momento: 1, timestamp: new Date('2020-01-01T00:00:00') });
    expect(result[1]).toEqual({ momento: 2, timestamp: new Date('2020-01-01T00:00:01') });
    expect(result[2]).toEqual({ momento: 3, timestamp: new Date('2020-01-01T00:00:02') });
    // ... add assertions for the remaining moments and timestamps
  });

  test('se a data final for menor que a data incial o construtor deve lancçar uma exception', () => {
    expect(() => {
      new Simulador(entidades, dataFimSimulacao, dataInicioSimulacao);
    }).toThrow();
  });

});