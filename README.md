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

Para executar uma simulação, você deve criar uma nova instância do `Simulador`, adicionar suas entidades e eventos à linha do tempo e, em seguida, chamar o método `simular`. 

Ao executar uma simulação deve-se informar uma data de inicio e uma data fim para encerrar a simulação e uma escala de tempo em segundos. O simulador irá calcular o número de momentos necessários para simular o intervalo de tempo considerando escala de tempo informada. Por exemplo:
- Se a escala for 60 cada momento irá durar 60 segundos.

Ao disparar um evento durante a simulação a entidade recberá no evento a quantidade de momentos transcorridos (momentoAtual) e também um timestamp com a data transcorrida de acordo com a escala.


```typescript
const entidade = new MinhaEntidade();
// com estes parâmetros a simulação irá durar 1 minuto e cada momento irá durar 60 segundo.
// serão disparados 60 eventos com um segundo de intervalo entre eles.
const dataInicioSimulacao = new Date('2020-01-01T00:00:00');
const dataFimSimulacao    = new Date('2020-01-01T00:01:00');
const simulador = new Simulador([entidade], dataInicioSimulacao, dataFimSimulacao, 60);

if (await simulador.iniciar()) {
  for await (let momento of simulador.simular()) {
    // entidade.processarEvento receberá em timestampAtual as datas '2020-01-01T00:00:00', '2020-01-01T00:01:00', '2020-01-01T00:03:00'..
    console.log(momento);
  }
} else {
  console.error("Falha ao iniciar a simulação.");
}
```


# Configurando a duracao da simulação

A classe Simulador permite que você crie uma simulação que ocorre ao longo de uma linha do tempo. A simulação é definida por uma data de início e uma data de término. Por exemplo, você pode criar uma simulação que começa em '2023-12-01T00:00:00' e termina em '2023-12-31T23:59:59'.

## Escala

A escala é um valor numérico que determina a velocidade da simulação. Uma escala de 1 significa que a simulação avança em tempo real, ou seja, um segundo na simulação corresponde a um segundo na vida real. Para uma simulação que começa em '2023-12-01T00:00:00' e termina em '2023-12-31T23:59:59', uma escala de 1 faria a simulação durar exatamente 31 dias na vida real.

Uma escala de 60 significa que a simulação avança 60 vezes mais rápido que o tempo real, ou seja, um minuto na simulação corresponde a um segundo na vida real. Com esta escala, a simulação do período de um mês seria completada em aproximadamente 12 horas na vida real.

Da mesma forma, uma escala de 120 significa que a simulação avança 120 vezes mais rápido que o tempo real. Neste caso, cada minuto na simulação equivale a meio segundo na vida real, resultando na conclusão da simulação de um mês em cerca de 6 horas na vida real.

Por fim, uma escala de 600 significa que a simulação avança 600 vezes mais rápido que o tempo real. Aqui, cada minuto na simulação corresponde a 0,1 segundo na vida real. Portanto, a simulação de um mês seria concluída em aproximadamente 1 hora na vida real.



Esperamos que este projeto seja útil para suas necessidades de simulação. Se você tiver alguma dúvida ou sugestão, não hesite em nos contatar.