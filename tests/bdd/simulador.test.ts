import Simulador from '../../src/Simulador';
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
      simulador.agendarEvento(mockEntidade, `evento-${i}`, 'MockEntidade',  new Map<string, any>(), i);
    }
    for await (const marco of simulador.simular()) {
      result.push(marco.momento);
    }
    expect(result).toEqual([1,2,3,4,5,6,7,8,9,10]);
  });

  test('ao pararSimulacao deve encerrar a simulacao sem avançar para o próximo momento.', async() => {
    const result: Number[] = [];
    for(let i = 1; i <= 10; i++){
      simulador.agendarEvento(mockEntidade, `evento-${i}`, 'MockEntidade',  new Map<string, any>(), i);
    }
    for await (const marco of simulador.simular()) {
      result.push(marco.momento);
      if(result.length === 5){
        simulador.pararSimulacao();
      }
    }
    expect(result).toEqual([1,2,3,4,5]);
  });

  test('ao agendar um evento para uma entidade, o evento deve ser disparado durante a simulação.', async () => {
    simulador.agendarEvento(mockEntidade ,'teste', 'MockEntidade',  new Map<string, any>(), 1);
    const result: Number[] = [];
    for await (const marco of simulador.simular()) {
      result.push(marco.momento);
    }
    expect(mockEntidade.processarEvento).toHaveBeenCalled();
  });

  test('ao disparar um evento deve informar timestampAtual e o momentoAtual do evento.', async () => {
    const horario = simulador.agendarEvento(mockEntidade ,'teste', 'MockEntidade',  new Map<string, any>(), 1);
    for await (const _ of simulador.simular()) {
    }
    expect(mockEntidade.processarEvento).toHaveBeenCalledWith(
      mockEntidade, 
      'teste', 
      new Map<string, any>(), // Argumentos do evento
      1, // momentoAtual
      new Date(horario), // timestampAtual
      expect.any(Function) // agendarEvento
    );
  });

});