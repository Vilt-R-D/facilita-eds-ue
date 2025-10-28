# Ciclo de Vida do Carregamento do Site

A Adobe na sua [documentação](https://www.aem.live/developer/keeping-it-100#three-phase-loading-e-l-d), criaram o termo **Three-Phase Loading (E-L-D)** onde se divide o carregamento do payload do site em 3 fazes: E-L-D.

**Glossário**:

- **Largest Content Paint - LCP**: Métrica que mede o tempo de renderização do (visualmente) maior elemento que é renderizado na tela do usuário.
- **Cumulative Layout Shift - CLS**: Deslocamento visual dos elementos de uma página devido ao tempo distinto de renderização de diferentes elementos.
- **Total Blocking Time - TBT**: Métrica que mede o tempo em que a página está bloqueada a input do usuário.

## Fase E - Eager - Ansiosa

Fase focada em renderizar o **LCP**. Inicialmente o `main` está `hidden` para evitar `CLS`. Aqui o DOM começará ser "decorado".

Essa fase é focada no carregamento do topo do site, em termos de EDS, na **primeira Seção**. Normalmente o **LCP** é o **hero** do site.

Após os blocos da primeira seção e a própria seção carregar, o carregamento das fontes se iniciam.

Acaba a fase ansiosa.

## Fase L - Lazy - Preguiçosa

Nessa fase é carregada a porção do payload que não afeta o `TBT`. Isto inclui as próxima seções e seus blocos (JS e CSS) após a primeira.

É recomendado que nessa etapa todo o conteúdo venha da mesma origem que o próprio site.

## Fase D - Delayed - Atrasada

Aqui é onde deve ser carregado tudo que não impacte a experiência do usuário: Ferramentas de rastreio, gerenciamento de consentimento, etc...

Essa fase costuma começar 3 segundos após a primeira. Recomenda-se usar `delayed.js` para se trabalhar nela.