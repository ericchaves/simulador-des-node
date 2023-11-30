import { LinhaDoTempo, Evento } from '../../src/LinhaDoTempo'; // Ajuste o caminho conforme necessário

describe('LinhaDoTempo', () => {
  let linhaDoTempo: LinhaDoTempo;

  beforeEach(() => {
    linhaDoTempo = new LinhaDoTempo();
  });

  test('deve agendar um novo evento corretamente', () => {
    const evento: Evento = { nome: 'eventoTeste', entidade: 'entidadeTeste', espera: 5, argumentos: [] };
    linhaDoTempo.agendar(evento);
    expect(linhaDoTempo['eventos'].get(5)).toContain(evento);
  });

  test('não deve emitir eventos ao avançar no tempo sem eventos agendados', () => {
    const gerador = linhaDoTempo.avancarTempo();
    expect(gerador.next().done).toBe(true);
    expect(linhaDoTempo.momentoAtual).toBe(1);
  });

  test('deve emitir eventos ao avançar no tempo com eventos agendados', () => {
    linhaDoTempo.agendar({ nome: 'eventoTeste', entidade: 'entidadeTeste', espera: 1, argumentos: [] });
    const gerador = linhaDoTempo.avancarTempo();
    const resultado = gerador.next();
    expect(resultado.done).toBe(false);
    expect(resultado.value.nome).toBe('eventoTeste');
    expect(linhaDoTempo.momentoAtual).toBe(1);
  });

  test('deve emitir eventos na ordem correta quando múltiplos eventos são agendados para o mesmo momento', () => {
    linhaDoTempo.agendar({ nome: 'evento1', entidade: 'entidadeTeste', espera: 1, argumentos: [] });
    linhaDoTempo.agendar({ nome: 'evento2', entidade: 'entidadeTeste', espera: 1, argumentos: [] });
    const gerador = linhaDoTempo.avancarTempo();
    expect(gerador.next().value.nome).toBe('evento1');
    expect(gerador.next().value.nome).toBe('evento2');
  });

  test('deve avançar corretamente no tempo além dos eventos agendados', () => {
    linhaDoTempo.agendar({ nome: 'evento1', entidade: 'entidadeTeste', espera: 1, argumentos: [] });
    linhaDoTempo.agendar({ nome: 'evento2', entidade: 'entidadeTeste', espera: 2, argumentos: [] });
    let gerador;
    // Avançar duas vezes para cobrir todos os eventos agendados
    for(let i=1; i<=2; i++){
      gerador = linhaDoTempo.avancarTempo();
      gerador.next();
    }
    // Avançar uma vez mais além dos eventos agendados
    gerador = linhaDoTempo.avancarTempo();
    const resultado = gerador.next();
    expect(resultado.done).toBe(true);
    expect(linhaDoTempo.momentoAtual).toBe(3);
  });

  test('Um evento agendado para o momento atual deve ser disparado antes de avançar para o próximo momento.', () => {
    linhaDoTempo.agendar({ nome: 'evento1', entidade: 'entidadeTeste', espera: 1, argumentos: [] });
    const gerador = linhaDoTempo.avancarTempo();
    let evento = gerador.next().value;
    linhaDoTempo.agendar({ nome: 'evento2', entidade: 'entidadeTeste', espera: 0, argumentos: [] })
    evento = gerador.next().value;
    expect(evento.nome).toBe('evento2');
    expect(linhaDoTempo.momentoAtual).toBe(1);
  });

});
