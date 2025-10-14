# Pacotes Node

## Pacotes Originais

> Pacotes herdados do template [aem-boilerplate-xwalk](https://github.com/adobe-rnd/aem-boilerplate-xwalk). Commit `37358fc`.

| Nome                       |                 Versão                 | Descrição                                                                                                                                       |
| -------------------------- | :------------------------------------: | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| ~~@babel/eslint-parser~~   |                 7.28.4                 | Removido, pois suspeito que foi usado no inicio do template e depois não mais.                                                                  |
| eslint*                    | <span style="color: red">8.57.1</span> | `Depreciado` Analisa estaticamente a sintaxe de ECMAScript. Pode corrigir automaticamente.                                                      |
| eslint-config-airbnb-base* |                 15.0.0                 | Regras preferidas pela AirBnb. <span style="color: red"> Pacote legado sem expectativa de atualização impedindo migração para eslint v9 </span> |
| eslint-plugin-import*      |                 2.32.0                 | Regras opinadas para sintaxe de `import/export.`                                                                                                |
| eslint-plugin-json         |                 3.1.0                  | Regras de Linting para arquivos json                                                                                                            |
| eslint-plugin-xwalk        |                 GitHub                 | Valida o repositório template **adobe/aem-boilerplate-xwalk**                                                                                   |
| stylelint*                 |                16.21.1                 | Analisa estaticamente CSS.                                                                                                                      |
| stylelint-config-standard* |                 38.0.0                 | Regras de CSS padrões do pacote.                                                                                                                |

> \* Pacotes instalados também no template original de eds [aem-boilerplate](https://github.com/adobe/aem-boilerplate). Commit `45e1552`.

| Nome           | Versão | Descrição                                                                               |
| -------------- | :----: | --------------------------------------------------------------------------------------- |
| husky          | 9.1.1  | Ferramenta que facilita a análise de mensagem de commits e criação de git hooks         |
| merge-json-cli | 1.0.4  | Utilitário para facilmente juntar arquivos `.json` num só.                              |
| npm-run-all    | 4.1.5  | Utilitário para executar vários scripts do package.json de forma paralela ou sequencial |

### Husky, merge-json-cli e npm-run-all

Há 3 arquivos especiais para integrar o Universal Editor ao EDS:

- [component-definition.json](component-definition.json)
- [component-filters.json](component-filters.json)
- [component-component-models.json](component-component-models.json)

Eles descrevem o comportamento de partes da página no UE, pode ser inconveniente alterar esses arquivos toda vez que se vai mexer num bloco.

Por isso, na versão do template que esse projeto está usando, há o comportamento de fazer uma definição desses arquivos por bloco.

Para isso, o Husky cria um pre-hook que executa o script [`pre-commit.mjs`](/.husky/pre-commit.mjs) antes de um commit ser executado.
O script usa o **merge-json-cli** e **npm-run-all**para juntar todos os arquivos `.json` diferentes num só e criar os `component-definition.json, component-filters.json, component-models.json` automaticamente.

## Pacotes Adicionados

> Insira os pacotes que foram adicionados ao longo do projeto.

| Nome       | Quem Adicionou | Versão | Justificativa                         |
| ---------- | :------------: | :----: | ------------------------------------- |
| extensão-x |   @gLeirbag    |  x.x   | "Para criar x elemento, facilita ..." |