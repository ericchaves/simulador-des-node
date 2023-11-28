# Simulador DES em Node.js e TypeScript

Este projeto implementa um Simulador de Eventos Discretos (DES) usando Node.js e TypeScript. Ele é projetado para ser flexível, permitindo aos usuários definir suas próprias entidades e simular uma variedade de cenários.

## O que é um Simulador de Eventos Discretos (DES)?

Um Simulador de Eventos Discretos (DES) é um tipo de simulador usado para modelar a iteração entre entidades que compõem o sistema simulado. O estado das entidades muda em pontos específicos no tempo. 

Em um simulador DES, o fluxo do tempo é representado por uma série de eventos agendados em uma linha do tempo. Cada evento está associado a uma entidade da simulação e na medida em que a simulação avança as entidades recebem seus eventos podendo reagir a elas, alterando seus controles e estados internos, e agendando novos eventos à linha do tempo em resposta a estas alterações. 

Este tipo de simulação é particularmente útil para sistemas complexos em áreas como logística, redes de computadores, processos industriais, e mais.

## Arquitetura do projeto

O projeto é dividido nas seguintes classes e interfaces principais:

- `Simulador`: Esta é uma classe que controla a execução da simulação. Ao criar uma instância de Simulador é preciso informar a lista de entidades que serão usadas durante a simulação. Internamente o simulador possui uma `LinhaDoTempo` onde eventos são agendados para serem recebidos e processados pelas entidades na medida em que a simulação percorre a linha do tempo. O tempo de um simulação não é contado em segundos em sim em "momentos" de uma unidade iniciando pelo momento '0' (zero). 

- `Entidades`: Entidades são classes que geram eventos e processam eventos durante a simulaçao. Para isso devem implementar a interface `IEntidade`. Esta interface define o nome usado para identificar cada entidade e declara dois métodos que serão chamados usados pelo `Simulador`. São eles `inicializar` e `processarEvento`. O método `inicializar` é usado para que a entidade adicione os primeiros eventos à linha do tempo da simulação e o método `processarEvento` por sua vez é chamado durante a execução da simulação a cada vez que um evento agendado é disparado, permitindo que entidade reaja aos eventos que ocorrem durante a simulação, podendo inclusive adicionar novos eventos à linha do tempo.

- `Evento`: É um tipo de dado que representa um evento discreto (pontual) na simulação. Eventos não possuem comportamento. Cada evento possui um `nome` para identificar seu "tipo", uma `entidade` responsável pelo seu processamento e um valor de `espera` que representa unidades de tempo até que o evento seja disparado, contadas a partir do momento do agendamento (o valor de `espera` é sempre um valor relativo e nunca absoluto). Além disso cada evento possui um campo `argumentos` usado passar parâmetros adicionais usados pela entidade para identificar e processar o evento.

## Como usar

Para criar suas próprias simulações primeiro é precis definir suas entidades. Você deve criar uma nova classe que implementa a interface `IEntidade`. Aqui está um exemplo:

```typescript
class MinhaEntidade implements IEntidade {
  nome: string;
  async inicializar(agendar: (evento: Evento) => void): Promise<boolean> {
    // Implemente a lógica para adicionar eventos à linha do tempo aqui.
    return true;
  }
  processarEvento(nome: string, argumentos: Record<string, any>[], momento: number): boolean {
    // Implemente a lógica para processar o evento aqui.
    return true;
  }
}
```

Para executar uma simulação, você deve criar uma nova instância do `Simulador`, adicionar suas entidades e eventos à linha do tempo e, em seguida, chamar o método `simular`. Aqui está um exemplo:

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