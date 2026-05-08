# Feature Specification: Card Stack Teaser

**Feature Branch**: `006-card-stack-teaser`
**Created**: 2026-05-08
**Status**: Draft
**Input**: User description: "Card Stack Teaser — half-image module com carrossel de cards (ícone + texto), título/texto e CTA, com temas de cor por card e variação responsiva."

<!-- cacophony:meta
{tracker:plane,projectId:afdad5e0-217c-4d9a-b3dd-70388a3571b4,issueId:b50d7dab-d631-433d-b215-0977da245768,attachments:[{id:f777c771-2e76-4c84-af9b-f0a8e5c7d1c6,name:css-desktop.txt,url:https://api.plane.so/api/v1/workspaces/vilt-demo/projects/afdad5e0-217c-4d9a-b3dd-70388a3571b4/work-items/b50d7dab-d631-433d-b215-0977da245768/attachments/f777c771-2e76-4c84-af9b-f0a8e5c7d1c6/},{id:09b19915-c033-43c8-bd07-60342d4aa03b,name:css-mobile.txt,url:https://api.plane.so/api/v1/workspaces/vilt-demo/projects/afdad5e0-217c-4d9a-b3dd-70388a3571b4/work-items/b50d7dab-d631-433d-b215-0977da245768/attachments/09b19915-c033-43c8-bd07-60342d4aa03b/}]}
-->

## Clarifications

### Session 2026-05-08

- Q: Como o ícone de cada card é fornecido pelo autor? → A: Upload de imagem/SVG por card via Universal Editor (campo de imagem).
- Q: Qual o tema padrão de card quando o autor não seleciona um? → A: Fallback fixo = `branco`.
- Q: O carousel tem autoplay? → A: Sem autoplay; avanço só por clique no card ou dot.
- Q: Formato dos campos título e texto na autoração? → A: Ambos richtext (markup inline permitido: `<strong>`, `<em>`, `<br>`, link inline).
- Q: Acessibilidade por teclado no carousel? → A: Apenas dots são tabuláveis (`<button>`), Enter/Space avança; cards ficam fora do tab order.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitor sees teaser with title, text, CTA and card stack on desktop (Priority: P1)

Como visitante em desktop, vejo um teaser fullwidth com módulo half-image: à esquerda, título e texto no topo e CTA abaixo; à direita, uma pilha de cards ilustrativos (ícone + texto) ocupando a metade do módulo. O conjunto entrega rapidamente a mensagem do bloco e o caminho de ação principal.

**Why this priority**: É o estado de leitura inicial e a configuração mínima entregável. Sem ele, o bloco não comunica nem direciona o visitante; logo, é o MVP do teaser.

**Independent Test**: Publicar uma instância do bloco com título, texto, CTA e pelo menos 3 cards (cada um com ícone + texto). Validar em desktop que o layout half-image renderiza com o lado de texto/CTA à esquerda e a pilha de cards à direita, alinhada ao tema da Section.

**Acceptance Scenarios**:

1. **Given** instância autorada com título, texto, CTA e 3 cards, **When** visitante carrega a página em viewport desktop, **Then** vê o título e o texto no topo esquerdo, o CTA abaixo, e a pilha de cards na metade direita do módulo.
2. **Given** instância sem CTA autorado, **When** visitante carrega a página, **Then** o lado esquerdo apresenta apenas título e texto, sem espaço residual de CTA.
3. **Given** Section parente com tema definido, **When** o teaser renderiza, **Then** cores e tipografia herdam os tokens dessa Section (não aplicam estilo conflitante).

---

### User Story 2 - Visitor advances the card stack via click or dot (Priority: P1)

Como visitante em desktop, posso avançar a pilha de cards clicando em um card ou em um dot do controle. A interação é apenas de avanço (sem retrocesso e sem salto para card específico): o primeiro card da pilha desloca-se para a direita e retorna pelo mesmo caminho até a última posição da pilha, com animação. Os dots refletem a posição atual e não são alvos de salto direto, apenas avanço sequencial.

**Why this priority**: É o comportamento interativo central do bloco e está descrito com regras específicas (avanço único, animação de "envio para o fim da pilha"). Sem ele o teaser perde a entrega multi-card.

**Independent Test**: Com 4 cards autorados, clicar no card visível ou no dot ativo e observar que o card do topo se anima saindo pela direita e retorna ao final da pilha, e que o card seguinte assume o topo. Repetir o ciclo confirmando que após o último card o ciclo retorna ao primeiro.

**Acceptance Scenarios**:

1. **Given** pilha com 4 cards, **When** visitante clica no card visível, **Then** o card do topo executa animação saindo pela direita e retornando até a última posição da pilha; o próximo card assume o topo; o dot ativo avança em uma posição.
2. **Given** pilha com 4 cards e dot ativo no índice 0, **When** visitante clica em qualquer dot, **Then** ocorre o mesmo avanço de uma posição (independente do dot clicado): o sistema só avança, nunca salta para um índice arbitrário e nunca retrocede.
3. **Given** pilha posicionada no último card, **When** visitante avança novamente, **Then** o ciclo retorna ao primeiro card, mantendo a mesma animação.
4. **Given** instância com apenas 1 card, **When** visitante carrega a página, **Then** os controles de carousel (dots) não são exibidos e cliques no card não disparam animação.

---

### User Story 3 - Mobile sequential layout without carousel (Priority: P1)

Como visitante em mobile, vejo os elementos do Card Stack Teaser empilhados em sequência vertical, sem carrossel: Título → Texto → Cards (todos visíveis em sequência) → CTA. O bloco continua fullwidth e responde ao tema da Section.

**Why this priority**: É a regra explícita de responsividade e cobre a maior parte do tráfego. Sem ela, o bloco quebra em telas pequenas.

**Independent Test**: Abrir a mesma instância em viewport mobile (largura típica de smartphone) e verificar a ordem vertical Título / Texto / Cards / CTA, ausência de dots/controles de carousel, e que cada card permanece visível (não há cards ocultos atrás de outros).

**Acceptance Scenarios**:

1. **Given** instância autorada com título, texto, 3 cards e CTA, **When** visitante carrega em viewport mobile, **Then** vê os elementos em ordem vertical Título → Texto → Cards → CTA.
2. **Given** mesma instância em mobile, **When** visitante observa a área de cards, **Then** todos os cards estão visíveis em sequência (sem pilha animada, sem dots, sem controles de avanço).
3. **Given** mesma instância em mobile, **When** visitante interage com um card, **Then** nenhuma animação de avanço de carousel ocorre (cards são ilustrativos, sem estado).

---

### User Story 4 - Author selects per-card color theme (Priority: P2)

Como autor (Universal Editor), seleciono individualmente o tema de cor de cada card entre as opções disponíveis (preto, verde escuro, verde claro, branco). Cada card respeita o tema escolhido independentemente do tema da Section parente.

**Why this priority**: Eleva a versatilidade visual sem ser bloqueante para o MVP de leitura. Tema da Section continua governando o restante do teaser; os temas de card são uma camada adicional.

**Independent Test**: Em uma instância com 4 cards, atribuir a cada card um dos temas (preto, verde escuro, verde claro, branco) via Universal Editor e validar que cada card renderiza nas cores correspondentes em desktop e mobile.

**Acceptance Scenarios**:

1. **Given** card autorado com tema "preto", **When** visitante o vê na página, **Then** o card apresenta a paleta correspondente ao tema preto (fundo, ícone e texto consistentes).
2. **Given** quatro cards com temas distintos (preto, verde escuro, verde claro, branco), **When** o teaser renderiza, **Then** cada card mantém seu tema independente e legível, sem herdar o tema dos cards vizinhos.
3. **Given** card autorado sem tema explícito, **When** o teaser renderiza, **Then** o card aplica o tema padrão `branco` sem quebrar o layout.

---

### User Story 5 - CTA hover affordance (Priority: P3)

Como visitante em desktop, ao passar o cursor sobre o CTA percebo um estado hover distinto do estado normal, sinalizando que o elemento é clicável.

**Why this priority**: Refinamento de affordance visual; bloco continua funcional sem ele.

**Independent Test**: Em desktop, posicionar o cursor sobre o CTA e observar mudança visual consistente com o tema da Section/Componente em relação ao estado normal.

**Acceptance Scenarios**:

1. **Given** CTA renderizado em estado normal, **When** visitante posiciona o cursor sobre ele, **Then** observa um estado hover visualmente distinto.
2. **Given** CTA em foco via teclado, **When** o foco é visível, **Then** o estilo de foco é claramente perceptível (não suprimido).

---

### Edge Cases

- Apenas 1 card autorado: controles de carousel suprimidos e clique no card não dispara animação.
- 0 cards autorados: o bloco não exibe área de pilha vazia; o lado direito do half-image colapsa de modo gracioso (e o lado de texto/CTA continua válido).
- Muitos cards (ex.: 8+): a pilha visualmente comporta o conjunto sem quebrar layout; dots permanecem proporcionais e legíveis.
- Texto/título muito longo: mantém respiro do layout half-image em desktop; em mobile permite quebra natural sem cortar conteúdo.
- CTA ausente: lado esquerdo renderiza apenas título e texto, sem espaço vazio aparente.
- Card sem ícone autorado: o card permanece legível com ênfase apenas no texto.
- Tema de card inválido/ausente na autoração: card aplica tema padrão `branco`.
- Animação interrompida por clique repetido rápido: o carousel processa apenas um avanço por vez (cliques durante a animação são ignorados ou enfileirados para um único próximo avanço).
- Section parente sem tema definido: teaser usa tokens globais padrão do site.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O bloco MUST renderizar como teaser fullwidth, ocupando 100% da largura do contêiner pai.
- **FR-002**: Em desktop, o bloco MUST apresentar layout half-image com lado esquerdo contendo título, texto e CTA, e lado direito contendo a pilha de cards.
- **FR-003**: Em desktop, título e texto MUST ficar no topo do lado esquerdo, e o CTA MUST ficar abaixo deles na mesma coluna.
- **FR-004**: Em mobile, o bloco MUST apresentar os elementos em sequência vertical na ordem Título → Texto → Cards → CTA, sem carrossel nem controles de carousel.
- **FR-005**: Em desktop com 2+ cards, o bloco MUST exibir uma pilha visual de cards e um conjunto de dots indicando a posição atual.
- **FR-006**: O bloco MUST avançar a pilha somente para frente: clique no card visível e clique em qualquer dot disparam o mesmo avanço de uma posição. Não há retrocesso, não há salto para card específico, e não há autoplay (avanço automático por tempo).
- **FR-007**: O avanço da pilha MUST ser animado: o card do topo se desloca para a direita e retorna pelo mesmo caminho até a última posição da pilha.
- **FR-008**: Quando a pilha estiver no último card, o próximo avanço MUST retornar ao primeiro card (ciclo).
- **FR-009**: Cada card MUST ser composto por ícone e texto (formato compacto), sem estados interativos próprios além do avanço da pilha. O ícone MUST ser fornecido pelo autor via campo de upload de imagem/SVG no Universal Editor (não via referência a ícone do design system).
- **FR-010**: Os dots MUST refletir o card atualmente no topo e atualizar a indicação visual a cada avanço.
- **FR-011**: Com apenas 1 card, o bloco MUST suprimir os dots e desabilitar o disparo de animação ao clique no card.
- **FR-012**: O bloco MUST herdar cores e tokens tipográficos da Section/Componente parente para título, texto, dots e CTA.
- **FR-013**: O autor MUST poder selecionar individualmente o tema de cor de cada card entre as opções: preto, verde escuro, verde claro, branco.
- **FR-014**: O tema selecionado em um card MUST aplicar paleta consistente a fundo, ícone e texto desse card sem afetar os demais cards nem o restante do teaser.
- **FR-015**: O CTA MUST oferecer estados visuais distintos para normal e hover, e MUST manter um estado de foco visível para navegação por teclado.
- **FR-016**: O bloco MUST permanecer responsivo entre os breakpoints definidos no projeto, alternando entre o layout half-image (desktop) e a sequência vertical (mobile) sem perda de conteúdo.
- **FR-017**: Cliques sucessivos durante a animação de avanço MUST não causar saltos múltiplos imprevisíveis: o sistema processa um avanço por vez.
- **FR-018**: O bloco MUST funcionar via Universal Editor (autoração de título, texto, CTA, lista de cards e tema por card) e refletir mudanças no preview/published de AEM EDS.
- **FR-019**: Os campos `título` e `texto` MUST aceitar richtext com markup inline (`<strong>`, `<em>`, `<br>`, link inline) preservado no rendering. CSS de tipografia MUST escopar via `.<bloco> p` (não no wrapper) para não conflitar com `styles/styles.css`. O campo `texto` do card MUST permanecer plain text (sem richtext) por ser conteúdo curto/compacto.
- **FR-020**: Os dots MUST ser elementos `<button>` tabuláveis no tab order natural, com label acessível (`aria-label` indicando posição, ex: "Avançar para o próximo card") e estado ativo refletido por `aria-current` ou equivalente. Enter e Space MUST disparar o avanço de uma posição. Os cards do stack MUST permanecer fora do tab order (não tabuláveis); o clique no card permanece habilitado para mouse, mas a navegação por teclado ocorre exclusivamente pelos dots.

### Key Entities

- **Card Stack Teaser (bloco)**: Unidade autorável que agrupa título, texto, CTA e uma lista ordenada de cards. Possui variante de layout half-image em desktop e sequência vertical em mobile. Herda tema da Section parente.
- **Card**: Item da lista do teaser, composto por ícone (imagem/SVG enviada via upload no Universal Editor) e texto curto. Possui atributo de tema de cor (preto, verde escuro, verde claro, branco). Sem estados interativos próprios.
- **Dot Control**: Indicador discreto que reflete a posição atual da pilha; clique em qualquer dot avança uma posição (não salta para índice arbitrário). Existe somente quando há 2+ cards.
- **CTA**: Botão/link com rótulo e destino, com estados normal/hover/foco.
- **Tema de Section/Componente**: Conjunto de tokens (cores, tipografia) herdado pelo teaser; o tema dos cards é independente desse tema.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em desktop, 100% das instâncias autoradas com 2+ cards exibem o avanço cíclico do carousel (card 1 → 2 → … → N → 1) com animação consistente entre cliques.
- **SC-002**: Em mobile, 100% das instâncias apresentam os elementos na ordem Título → Texto → Cards → CTA, sem dots nem animação de pilha.
- **SC-003**: 100% dos cards autorados com um dos quatro temas suportados (preto, verde escuro, verde claro, branco) renderizam a paleta correta em ambas as resoluções (desktop e mobile).
- **SC-004**: Visitante consegue identificar o CTA e percebê-lo como clicável (mudança visual no hover/foco) em pelo menos 95% das tentativas observadas em testes de usabilidade.
- **SC-005**: Cliques sucessivos durante a animação não geram saltos extras inesperados em 100% dos casos (o teaser permanece sincronizado entre dot ativo e card visível).
- **SC-006**: Em viewport desktop padrão (≥1024px), o bloco mantém o layout half-image fullwidth sem overflow horizontal em 100% das instâncias autoradas dentro dos limites do template (texto e número de cards típicos do projeto).
- **SC-007**: A troca de viewport entre mobile e desktop em uma mesma instância autorada não exige re-autoração: o conteúdo se adapta automaticamente em 100% dos casos.

## Assumptions

- Tema padrão do card (quando o autor não seleciona um) é `branco` (fallback fixo determinístico, independente do tema da Section parente); o conjunto de quatro opções (preto, verde escuro, verde claro, branco) é a lista fechada autorizada para v1.
- Os tokens de cor e tipografia da Section parente já existem no design system do projeto e são reutilizados (não são definidos novamente neste bloco).
- O bloco se integra ao padrão AEM EDS / Universal Editor já adotado no projeto (decoração via `blocks/<feature-slug>/<feature-slug>.{js,css}` e configuração via `_<feature-slug>.json`).
- Breakpoints de desktop e mobile seguem os já definidos em `styles/styles.css` do projeto; nenhum breakpoint novo é introduzido.
- O CTA usa o componente/estilo de botão do projeto; este bloco não define um novo padrão de botão.
- Os dois anexos `css-desktop.txt` e `css-mobile.txt` referenciados no bloco `cacophony:meta` acima serão consultados na fase de implementação (Constitution Principle VII) como fonte de verdade do estilo final em cada viewport; ajustes de spec só ocorrerão se o conteúdo dos anexos contradisser premissas aqui assumidas.
- A interação de avanço-único (sem salto, sem retrocesso) é intencional do design e não substituível por avanço/retrocesso bidirecional.
- Acessibilidade básica é coberta pelo padrão do projeto (foco visível, ordem de tab natural). No carousel, apenas dots (`<button>`) são tabuláveis; cards do stack ficam fora do tab order para evitar duplicar caminho de avanço por teclado.
