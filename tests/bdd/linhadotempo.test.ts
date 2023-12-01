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

  test('deve agendar um novo evento corretamente', () => {
    const evento: Evento = { emissor: mockEntidade, nome: 'eventoTeste', entidade: 'entidadeTeste', espera: 5, argumentos: [] };
    linhaDoTempo.agendar(evento);
    expect(linhaDoTempo['eventos'].get(5)).toContain(evento);
  });

  test('não deve emitir eventos ao avançar no tempo sem eventos agendados', () => {
    const gerador = linhaDoTempo.avancarTempo();
    expect(gerador.next().done).toBe(true);
    expect(linhaDoTempo.momentoAtual).toBe(1);
  });

  test('deve emitir os eventos agendados ao avançar no tempo', () => {
    linhaDoTempo.agendar({ emissor: mockEntidade, nome: 'eventoTeste', entidade: 'entidadeTeste', espera: 0, argumentos: [] });
    const gerador = linhaDoTempo.avancarTempo();
    const resultado = gerador.next();
    expect(resultado.done).toBe(false);
    expect(resultado.value.nome).toBe('eventoTeste');
    expect(linhaDoTempo.momentoAtual).toBe(0);
  });

  test('deve emitir eventos na ordem correta quando múltiplos eventos são agendados para o mesmo momento', () => {
    linhaDoTempo.agendar({ emissor: mockEntidade, nome: 'evento1', entidade: 'entidadeTeste', espera: 0, argumentos: [] });
    linhaDoTempo.agendar({ emissor: mockEntidade, nome: 'evento2', entidade: 'entidadeTeste', espera: 0, argumentos: [] });
    const gerador = linhaDoTempo.avancarTempo();
    expect(gerador.next().value.nome).toBe('evento1');
    expect(gerador.next().value.nome).toBe('evento2');
  });

  test('deve avançar corretamente no tempo além dos eventos agendados', () => {
    linhaDoTempo.agendar({ emissor: mockEntidade, nome: 'evento1', entidade: 'entidadeTeste', espera: 0, argumentos: [] });
    linhaDoTempo.agendar({ emissor: mockEntidade, nome: 'evento2', entidade: 'entidadeTeste', espera: 1, argumentos: [] });
    // executa duas vezes para receber todos eventos agendados
    for(let i = 0; i < 2; i++){
      // Avançar para receber o evento agendado
      let gerador = linhaDoTempo.avancarTempo();
      let resultado = gerador.next(); // Processa evento1
      while (!resultado.done) {
        resultado = gerador.next();
      }
    }
    expect(linhaDoTempo.momentoAtual).toBe(2);  
    // Avançar uma vez mais indo além dos eventos agendados
    let gerador = linhaDoTempo.avancarTempo();
    const resultado = gerador.next();
    expect(resultado.done).toBe(true);
    expect(linhaDoTempo.momentoAtual).toBe(3);
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
    expect(linhaDoTempo.momentoAtual).toBe(1);
  });

  test('deve calcular o timestamp corretamente para o momento atual conforme a escala em segundos', () => {
    linhaDoTempo = new LinhaDoTempo(new Date('2020-01-01T00:00:00'), 10, 60);
    expect(linhaDoTempo.obterTimestampAtual(10)).toEqual(new Date('2020-01-01T00:10:00'));
  });

});
