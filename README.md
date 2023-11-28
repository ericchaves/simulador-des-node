# Simulador DES em Node.js e TypeScript

Este projeto implementa um Simulador de Eventos Discretos (DES) usando Node.js e TypeScript. Ele é projetado para ser flexível, permitindo aos usuários definir suas próprias entidades e simular uma variedade de cenários.

## O que é um Simulador de Eventos Discretos (DES)?

Um Simulador de Eventos Discretos (DES) é um tipo de simulador usado para modelar a iteração entre entidades que compõem o sistema simulado. O estado das entidades muda em pontos específicos no tempo. 

Em um simulador DES, o fluxo do tempo é representado por uma série de eventos agendados em uma linha do tempo. Cada evento está associado a uma entidade da simulação e na medida em que a simulação avança as entidades recebem seus eventos podendo reagir a elas, alterando seus controles e estados internos, e agendando novos eventos à linha do tempo em resposta a estas alterações. 

Este tipo de simulação é particularmente útil para sistemas complexos em áreas como logística, redes de computadores, processos industriais, e mais.

## Como funciona este Simulador?

O projeto é dividido nas seguintes classes e interfaces principais:

- `Entidades`: Entidades, que implementam a interface `IEntidade`, são classes que controlam o estado e a lógica do sistema simulado. Elas são atualizadas por eventos próprios e interagem entre si por meio destes eventos. O método `inicializar` é usado para que a entidade adicione os primeiros eventos à linha do tempo da simulação antes da simulação começar e o método `processarEvento` é chamado durante a execução da simulação para que a entidade reaja aos eventos que recebeu, atualizando seu estado interno e agendando novos eventos à linha do tempo.

- `Eventos`: Eventos são mensagens com nome, entidade responsável, um valor de espera (tempo até disparo) e argumentos com detalhes adicionais, usados pelas entidades para atualizar seu estado.

Eventos são mensagens enviadas para as entidades, permitindo que elas atualizem seu estado interno. Um evento possui um `nome`, uma `entidade` responsável pelo seu processamento e um valor de `espera` que representa unidades de tempo até que o evento seja disparado, contadas a partir do momento do agendamento (o valor de `espera` é sempre um valor relativo e nunca absoluto). Além disso cada evento possui um campo `argumentos` usado passar parâmetros adicionais usados pela entidade para identificar e processar o evento.

- `Simulador`: O Simulador gerencia a simulação através de uma LinhaDoTempo, agendando e processando eventos e requer uma lista de entidades. O simulador é responsável por iniciar a simulação, processar os eventos e atualizar as entidades, e também por gerar o fluxo de tempo da simulação, que é uma série de momentos em que os eventos são processados.

## Criando uma nova simulação

Para criar suas próprias simulações primeiro é preciso construir as entidades que participarão da simulação, criando classes que implementem a interface `IEntidade`. Veja os exemplos na pasta `modelos`.

```typescript
class MinhaEntidade implements IEntidade {
  // implemente os métodos da interface
  async inicializar(agendarEvento: AgendarEventoFunction): Promise<boolean> {
    // adicione eventos à linha do tempo
    agendarEvento('nome-do-evento', 'entidade-destino', [{argumento1: 'valor'},{argumento2: 30}], 10);
    return true;
  }

  async processarEvento(evento: string, argumentos: Record<string, any>[], momentoAtual: number, agendarEvento: AgendarEventoFunction): Promise<boolean>;
  {
    if(evento === 'nome-do-evento') {
      // faça algo
    }
    return true;
  }
}
```

Para executar uma simulação, você deve criar uma nova instância do `Simulador`, adicionar suas entidades e eventos à linha do tempo e, em seguida, chamar o método `simular`.

```typescript
const entidade = new MinhaEntidade();
const simulador = new Simulador([entidade],0, 100);

if (await simulador.iniciar()) {
  for await (let momento of simulador.simular()) {
    console.log(momento);
  }
} else {
  console.error("Falha ao iniciar a simulação.");
}
```

Esperamos que este projeto seja útil para suas necessidades de simulação. Se você tiver alguma dúvida ou sugestão, não hesite em nos contatar.