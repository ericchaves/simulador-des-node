# Simulador DES em Node.js e TypeScript

Este projeto implementa um Simulador de Eventos Discretos (DES) usando Node.js e TypeScript. Ele é projetado para ser flexível, permitindo aos usuários definir suas próprias entidades e simular uma variedade de cenários.

## O que é um Simulador de Eventos Discretos (DES)?

Um Simulador de Eventos Discretos (DES) é um tipo de simulador usado para modelar a iteração entre entidades que compõem o sistema simulado. O estado das entidades muda em pontos específicos no tempo. 

Em um simulador DES, o fluxo do tempo é representado por uma série de eventos agendados em uma linha do tempo. Cada evento está associado a uma entidade da simulação e na medida em que a simulação avança as entidades recebem seus eventos podendo reagir a elas, alterando seus controles e estados internos, e agendando novos eventos à linha do tempo em resposta a estas alterações. 

Este tipo de simulação é particularmente útil para sistemas complexos em áreas como logística, redes de computadores, processos industriais, e mais.

## Como funciona este Simulador?

O projeto é dividido nas seguintes classes e interfaces principais:

- `Entidades`: Entidades, que implementam a interface `IEntidade`, são classes que controlam o estado e a lógica do sistema simulado. Elas são atualizadas por eventos próprios e interagem entre si por meio destes eventos. O método `inicializar` é usado para que a entidade adicione os primeiros eventos à linha do tempo da simulação antes da simulação começar e o método `processarEvento` é chamado durante a execução da simulação para que a entidade reaja aos eventos que recebeu, atualizando seu estado interno e agendando novos eventos à linha do tempo.

- `Eventos`: Eventos são mensagens enviadas para entidades, permitindo que elas atualizem seu estado interno. Um evento possui um `nome`, um `emissor` (entidade emissora) do evento, a `entidade` responsável pelo seu processamento e um valor de `espera` que representa uma quantidade de tempo em segundos da simulação até que o evento seja disparado. O tempo de espera é contado a partir do momento do agendamento. Além disso cada evento possui um campo `argumentos` usado passar parâmetros adicionais usados pela entidade para identificar e processar o evento.

- `Simulador`: O Simulador gerencia a simulação através de uma LinhaDoTempo, agendando e processando eventos e requer uma lista de entidades. O simulador é responsável por iniciar a simulação, processar os eventos e atualizar as entidades, e também por gerar o fluxo de tempo da simulação, que é uma série de momentos em que os eventos são processados.


## Criando uma nova simulação

Para criar suas próprias simulações primeiro é preciso construir as entidades que participarão da simulação, criando classes que implementem a interface `IEntidade`. Veja os exemplos na pasta `exemplos`. 

```typescript
class MinhaEntidade implements IEntidade {
  // implemente os métodos da interface
  async inicializar(agendarEvento: AgendarEventoFunction): Promise<boolean> {
    // adicione eventos à linha do tempo
    agendarEvento('nome-do-evento', 'entidade-destino', [{argumento1: 'valor'},{argumento2: 30}], 10);
    return true;
  }

  async processarEvento(evento: string, argumentos: Record<string, any>[], momentoAtual: number, timestampAtual: Date, agendarEvento: AgendarEventoFunction): Promise<boolean>;
  {
    if(evento === 'nome-do-evento') {
      // faça algo
    }
    return true;
  }
}
```

Para executar uma simulação, você deve criar uma nova instância do `Simulador`, adicionar suas entidades e eventos à linha do tempo e, em seguida, chamar o método `simular`. A data inicial informada é usada pelo simulador para calcular o timestamp de cada evento disparado durante a simulação.

Ao executar uma simulação, a linha do tempo avança entre as datas dos eventos agendados. Em outras palavras, o tempo de duração de uma simulação não depende das datas dos eventos agendados, mas sim da quantidade de eventos agendados durante a simulação. 

Enquanto houver eventos agendados na linha do tempo, a simulação continuará. Quando não houver mais eventos agendados, a simulação termina.
Ao receber um evento as entidades pode agendar novos eventos durante a simulação que podem ser  disparados imediatamente (espera = 0) ou em um momento futuro (espera > 0).

Durante a simulação, após disparar todos os eventos agendados para um certo momento, o simulador emite um `Marco` que registra o `momentoAtual` com a quantidade de segundos simulados transcorridos desde a data inicial, o `timestampAtual` com a data simulada e o `totalEventos` disparados naquele momento.

```typescript
const entidade = new MinhaEntidade();
const dataInicioSimulacao = new Date('2020-01-01T00:00:00');
const simulador = new Simulador([entidade], dataInicioSimulacao);

if (await simulador.iniciar()) {
  for await (let momento of simulador.simular()) {
    console.log(momento);
  }
} else {
  console.error("Falha ao iniciar a simulação.");
}
```

Esperamos que este projeto seja útil para suas necessidades de simulação. Se você tiver alguma dúvida ou sugestão, não hesite em nos contatar.