# Abordagem do CSS

[https://www.aem.live/docs/dev-collab-and-good-practices#CSS](https://www.aem.live/docs/dev-collab-and-good-practices#CSS)

Neste projeto, mire em criar a estilização de seu "componente visual" num escopo próprio. Isso é, crie arquivos `.css` próprios para teu bloco.

- **Estilize para dentro**, você quer que a estilização de um componente altere somente seus elementos internos, e não altere coisas externas a eles.
  - Para isso, defina bem os seus nomes e use bem [seletores](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_selectors).
- Tenha noção que o CSS externo ao teu bloco pode afeta-lo. Na verdade isso é importante, por exemplo, para já usar as definições de cores já definidas em outras partes do projeto (como no css global, por exemplo).

## CSS Fundamental

Embora seja indicado um escopo por bloco, isso não quer dizer que não será usado definições globais. Definições globais são importantes e são usadas nesse projeto para:

- Definição de fontes e cores.
- Reset e padronização de elementos(Ex: Retiragem de margem, etc...)
