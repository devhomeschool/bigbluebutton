# Project Magic (BigBlueButton)
======

## Sumário de modificações:

  - [Levantar mão em ordem cronológica](#levantar-mão-em-ordem-cronológica)
  - [Tempo da aula](#tempo-da-aula)
  - [Chat com tempo da aula decorrido](#chat-com-tempo-da-aula-decorrido)
  - [Lista de usuários sorteada por mãos levantadas](#lista-de-usuários-sorteada-por-mãos)

======

## Levantar mão em ordem cronológica

  1. Moderadores e apresentadores devem receber um popup do react-toastify sem tempo definido para desaparecer.
  2. As notificações são ordenadas pela mais antiga primeiro

  No [componente do app](./bigbluebutton-html5/imports/ui/components/app/component.jsx) foi necessário criar uma
  mensagem customizada para mão levantada no react-toastify.
  Para isso foi criado na linha 62 o objeto ``raisedHand`` que chama as mensagens de acordo com a linguagem do usuário.
  A mensagem foi adicionada para o [português de Portugal](./bigbluebutton-html5/private/locales/pt.json), [português brasileiro](./bigbluebutton-html5/private/locales/pt_BR.json) e [inglês](./bigbluebutton-html5/private/locales/en.json).
  No momento em que o componente app entra no ComponentDidUpdate é realizado uma avaliação se alguma informação na lista de usuários foi alterada
  e se o usuário é moderador ou não.
  Caso haja alterações, é realizado um filtro daqueles usuários que possuem o emoji ``raiseHand``de mão levantada.
  Caso existam mãos levantadas é feita a ordenação do array sendo o usuário que levantou primeiro colocado no início do array.
  Após a ordenação é realizado um ``map`` chamando a função ``notify`` do ``react-toastify`` com a mensagem customizada ``raisedHand`` interpolando o nome do usuário.
  Por exemplo, "${Rafael} levantou a mão" ou "${Rafael} raised the hand".
  As notificações de mão levantada não desaparecem sozinhas, tendo que o apresentador abaixar a mão do usuário, ou seja tirar a sua dúvida.
  A função notify recebe o parâmetro toastId com o nome do usuário para que não apareçam notificações repetidas.
  
  No [container do app](./bigbluebutton-html5/imports/ui/components/app/container.jsx) é feita a requisição ao mongodb
  da lista de usuários passando uma lista de informações necessárias em ``userFilter`` e armazenando o resultado em ``users``.
  Também é armazenado um valor booleano se o usuário é moderador ``amIModerator`` ou apresentador ``amIPresenter``.

## Tempo da aula

  1. O tempo da aula inicia quando o tempo da reunião é iniciado em meetingId
  2. Deve ficar localizado na barra superior, ao lado do botão de iniciar gravação

  No [componente da barra de navegação](./bigbluebutton-html5/imports/ui/components/nav-bar/component.jsx) é instanciado um estado inicial para a ``classTime``
  como nulo, assim como o ``initialTime``. Quando o componente é montado, é feita a requisição do tempo inicial da sessão e é iniciado um Timeout de um segundo para
  armazenar o tempo decorrido em ``classTime``. Após ``classTime`` ser instanciada no estado, haverá uma nova renderização da página, que chamará o setTimeout dentro
  de componentDidUpdate para instanciar um novo classTime a cada segundo.
  No [container da barra de navegação](./bigbluebutton-html5/imports/ui/components/nav-bar/container.jsx). A função que busca o tempo inicial ``checkInitialTime`` busca no mongodb a timestamp no momento de criação da reunião.
  a variável ``classTime```é renderizada no [componente de indicador de gravação](./bigbluebutton-html5/imports/ui/components/nav-bar/recording-indicator/component.jsx).


## Chat com tempo da aula decorrido

  1. O tempo em que a mensagem é enviada é subtraido do tempo inicial da aula

  No [container de chat](./bigbluebutton-html5/imports/ui/components/chat/container.jsx) é feita uma requisição ao mongodb do tempo inicial da reunião, na tabela ``Meeting``, campo ``durationProps`` e chave de valor ``createdTime``. O ``timestamp`` desse usuário é repassado como ``initialTime``
  para os demais componentes.
  No [componente do item de mensagem](./bigbluebutton-html5/imports/ui/components/chat/message-list/message-list-item/component.jsx) utiliza-se a
  variável ``time`` da mensagem para subtrair do tempo inicial da sessão para obter os minutos decorridos ``elapsedMinutes`` e as horas decorridas ``elapsedHours``.
  Caso o primeiro moderador ou apresentador sair da sessão e depois desse ocorrido, alguém mandar uma nova mensagem, o tempo decorrido da mensagem
  contará a partir do último moderador logado. Portanto, essa implementação deve ser alterada para receber por requisição de fora do BigBlueButton
  a informação do primeiro moderador ou apresentador logado

## Lista de usuários sorteada por mãos levantadas

  1. Os usuários são ordenados por mão levantada e pela mão que foi levantada primeiro
  2. A mão levantada tem prioridade maior que os demais emojis no ordenamento dos usuários

  Para ordenar os usuários por mão levantada foi necessário adicionar esta regra de negócio nos [serviços de lista de usuários](./bigbluebutton-html5/imports/ui/components/user-list/service.js).
  Na função sortUsers, a ordem de ordenamento está primeiramente pelo usuário atual em primeiro lugar, em seguida, pelos moderadores presentes e,
  logo em seguida por usuários com a mão levantada. Em seguida temos ordenamento por emojis, caso o usuário esteja assistindo por telefone e por último,
  por ordem alfabética dos nomes dos usuários.

## Poder de minimizar todas as telas de apresentação

## Botão de advertência
