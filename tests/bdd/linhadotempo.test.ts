import { LinhaDoTempo, Evento, IEntidade, AgendarEventoFunction } from '../../src/'; // Ajuste o caminho conforme necessário

const mockEntidade: IEntidade = {
  nome: 'MockEntidade',
  inicializar: jest.fn().mockImplementation((agendarEvento: AgendarEventoFunction) => Promise.resolve(true)),
  processarEvento: jest.fn().mockImplementation((emissor: IEntidade, evento: string, argumentos: Record<string, any>[], momentoAtual: number, agendarEvento: AgendarEventoFunction) => Promise.resolve(true))
};

describe('LinhaDoTempo', () => {
  let linhaDoTempo: LinhaDoTempo;
  const dataInicial = new Date('2020-01-01T00:00:00');

  beforeEach(() => {
    linhaDoTempo = new LinhaDoTempo(dataInicial);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('deve ser criada com a data inicial informada', () => {
    expect(linhaDoTempo.timestampInicial).toEqual(dataInicial);
  });

  test('deve agendar um novo evento para ser disparado quando o horário chegar', () => {
    const evento: Evento = { emissor: mockEntidade, nome: 'eventoTeste', entidade: 'entidadeTeste', espera: 5, argumentos: [] };
    const momento = linhaDoTempo.agendar(evento);
    expect(linhaDoTempo['eventos'].size).toBe(1);
    expect(linhaDoTempo['eventos'].get(momento / 1000)).toContain(evento);
  });

  test('não deve avançar no tempo se não houver eventos agendados', () => {
    const continuar = linhaDoTempo.avancarTempo();
    expect(continuar).toBe(false);
    expect(linhaDoTempo.timestampAtual.getTime()).toBe(linhaDoTempo.timestampInicial.getTime());
  });

  test('deve agendar o o evento para ser disparado em momento atual + espera em segundos', () => {
    const evento: Evento = { emissor: mockEntidade, nome: 'eventoTeste', entidade: 'entidadeTeste', espera: 5, argumentos: [] };
    const momento = linhaDoTempo.agendar(evento);
    const momentoEsperado = new Date(linhaDoTempo.timestampAtual.getTime() + 5000).getTime();
    expect(momento).toBe(momentoEsperado);
  });
  
  test('deve avançar o tempo para o proximo horario com eventos agendados', () => {
    const evento: Evento = { emissor: mockEntidade, nome: 'eventoTeste', entidade: 'entidadeTeste', espera: 5, argumentos: [] };
    const momento = linhaDoTempo.agendar(evento);
    const avancou = linhaDoTempo.avancarTempo();
    expect(linhaDoTempo.timestampAtual.getTime()).toBe(linhaDoTempo.timestampInicial.getTime()+ 5000);
    expect(avancou).toBe(true);
  })

  test('deve ignorar eventos agendados no passado', () => {
    const evento: Evento = { emissor: mockEntidade, nome: 'eventoTeste', entidade: 'entidadeTeste', espera: -5, argumentos: [] };
    const momento = linhaDoTempo.agendar(evento);
    expect(linhaDoTempo['eventos'].size).toBe(0);
  });

  test('ao emitir eventos agendados com espera zero não deve avançar o tempo', () => {
    const evento = { emissor: mockEntidade, nome: 'eventoTeste', entidade: 'entidadeTeste', espera: 0, argumentos: [] };
    linhaDoTempo.agendar(evento);
    const gerador = linhaDoTempo.emitirEventos();
    expect(gerador.next().value).toBe(evento);
    expect(linhaDoTempo.timestampAtual.getTime()).toBe(linhaDoTempo.timestampInicial.getTime());
  });

  test('deve emitir eventos na ordem correta quando múltiplos eventos são agendados para o mesmo momento', () => {
    linhaDoTempo.agendar({ emissor: mockEntidade, nome: 'evento1', entidade: 'entidadeTeste', espera: 0, argumentos: [] });
    linhaDoTempo.agendar({ emissor: mockEntidade, nome: 'evento2', entidade: 'entidadeTeste', espera: 0, argumentos: [] });
    const eventos = [...linhaDoTempo.emitirEventos()];
    expect(eventos[0].nome).toBe('evento1');
    expect(eventos[1].nome).toBe('evento2');
  });
  
  test('deve emitir eventos na ordem correta quando múltiplos eventos são agendados fora de ordem', () => {
    linhaDoTempo.agendar({ emissor: mockEntidade, nome: 'evento2', entidade: 'entidadeTeste', espera: 1, argumentos: [] });
    linhaDoTempo.agendar({ emissor: mockEntidade, nome: 'evento1', entidade: 'entidadeTeste', espera: 0, argumentos: [] });
    linhaDoTempo.agendar({ emissor: mockEntidade, nome: 'evento3', entidade: 'entidadeTeste', espera: 1, argumentos: [] });
    const eventos: Evento[] = [];
    for(const evento of linhaDoTempo.emitirEventos()){
      eventos.push(evento);
    }
    linhaDoTempo.avancarTempo();
    for(const evento of linhaDoTempo.emitirEventos()){
      eventos.push(evento);
    }
    expect(eventos[0].nome).toBe('evento1');
    expect(eventos[1].nome).toBe('evento2');
    expect(eventos[2].nome).toBe('evento3');
  });
});