import { LinhaDoTempo, Evento, IEntidade, AgendarEventoFunction } from '../../src/'; // Ajuste o caminho conforme necessário

const mockEntidade: IEntidade = {
  nome: 'MockEntidade',
  inicializar: jest.fn().mockImplementation((agendarEvento: AgendarEventoFunction) => Promise.resolve(true)),
  processarEvento: jest.fn().mockImplementation((emissor: IEntidade, evento: string, argumentos: Record<string, any>[], momentoAtual: number, agendarEvento: AgendarEventoFunction) => Promise.resolve(true))
};

describe('LinhaDoTempo', () => {
  let linhaDoTempo: LinhaDoTempo;

  beforeEach(() => {
    linhaDoTempo = new LinhaDoTempo();
  });

  test('deve ser criada com a data inicial informada', () => {
    const dataInicial = new Date('2020-01-01T00:00:00');
    linhaDoTempo = new LinhaDoTempo(dataInicial);
    expect(linhaDoTempo.timestampInicial).toEqual(dataInicial);
  });

  test('deve agendar um novo evento para ser disparado quando o horário chegar', () => {
    const evento: Evento = { emissor: mockEntidade, nome: 'eventoTeste', entidade: 'entidadeTeste', espera: 5, argumentos: [] };
    const momento = linhaDoTempo.agendar(evento);
    expect(linhaDoTempo['eventos'].size).toBe(1);
    expect(linhaDoTempo['eventos'].get(momento / 1000)).toContain(evento);
  });

  test('não deve avançar no tempo se não houver eventos agendados', () => {
    const gerador = linhaDoTempo.avancarTempo();
    expect(gerador.next().done).toBe(true);
    expect(linhaDoTempo.timestampAtual.getTime()).toBe(linhaDoTempo.timestampInicial.getTime());
  });

  test('deve ignorar eventos agendados no passado', () => {
    const evento: Evento = { emissor: mockEntidade, nome: 'eventoTeste', entidade: 'entidadeTeste', espera: -5, argumentos: [] };
    const momento = linhaDoTempo.agendar(evento);
    expect(linhaDoTempo['eventos'].size).toBe(0);
  });

  test('deve avançar o tempo ao emitir os eventos agendados para o futuro', () => {
    linhaDoTempo.agendar({ emissor: mockEntidade, nome: 'eventoTeste', entidade: 'entidadeTeste', espera: 1, argumentos: [] });
    const gerador = linhaDoTempo.avancarTempo();
    const resultado = gerador.next();
    expect(resultado.done).toBe(false);
    expect(resultado.value.nome).toBe('eventoTeste');
    expect(linhaDoTempo.timestampAtual.getTime()).toBeGreaterThan(linhaDoTempo.timestampInicial.getTime());
  });

  test('ao emitir eventos agendados com espera zero não deve avançar o tempo', () => {
    linhaDoTempo.agendar({ emissor: mockEntidade, nome: 'eventoTeste', entidade: 'entidadeTeste', espera: 0, argumentos: [] });
    const gerador = linhaDoTempo.avancarTempo();
    const resultado = gerador.next();
    expect(resultado.done).toBe(false);
    expect(resultado.value.nome).toBe('eventoTeste');
    expect(linhaDoTempo.timestampAtual.getTime()).toBe(linhaDoTempo.timestampInicial.getTime());
  });

  test('deve emitir eventos na ordem correta quando múltiplos eventos são agendados para o mesmo momento', () => {
    linhaDoTempo.agendar({ emissor: mockEntidade, nome: 'evento1', entidade: 'entidadeTeste', espera: 0, argumentos: [] });
    linhaDoTempo.agendar({ emissor: mockEntidade, nome: 'evento2', entidade: 'entidadeTeste', espera: 0, argumentos: [] });
    const gerador = linhaDoTempo.avancarTempo();
    expect(gerador.next().value.nome).toBe('evento1');
    expect(gerador.next().value.nome).toBe('evento2');
  });
  
  test('deve emitir eventos na ordem correta quando múltiplos eventos são agendados fora de ordem momento', () => {
    linhaDoTempo.agendar({ emissor: mockEntidade, nome: 'evento2', entidade: 'entidadeTeste', espera: 1, argumentos: [] });
    linhaDoTempo.agendar({ emissor: mockEntidade, nome: 'evento1', entidade: 'entidadeTeste', espera: 0, argumentos: [] });
    linhaDoTempo.agendar({ emissor: mockEntidade, nome: 'evento3', entidade: 'entidadeTeste', espera: 1, argumentos: [] });
    const gerador = linhaDoTempo.avancarTempo();
    expect(gerador.next().value.nome).toBe('evento1');
    expect(gerador.next().value.nome).toBe('evento2');
    expect(gerador.next().value.nome).toBe('evento3');
  });

  test('Um evento agendado para o momento atual deve ser disparado antes de avançar para o próximo momento.', () => {
    linhaDoTempo.agendar({ emissor: mockEntidade, nome: 'evento1', entidade: 'entidadeTeste', espera: 0, argumentos: [] });
    const gerador = linhaDoTempo.avancarTempo();
    let evento = gerador.next().value;
    linhaDoTempo.agendar({ emissor: mockEntidade, nome: 'evento2', entidade: 'entidadeTeste', espera: 0, argumentos: [] })
    evento = gerador.next().value;
    expect(evento.nome).toBe('evento2');
    // Necessário para avançar o generator
    expect(gerador.next().done).toBe(true);
    expect(linhaDoTempo.intervalos).toBe(0);
    expect(linhaDoTempo.timestampAtual).toStrictEqual(linhaDoTempo.timestampInicial);
  });

});
