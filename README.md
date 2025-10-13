# Facilita EDS

> Escrever descrição do projeto.

## Convenções do Repositório

- Código em inglês, comentários em Português.
- Evite ao máximo novas **dependências**. Caso adicione uma nova, [insira uma justificativa](/.docs/Pacotes%20Nodes.md/#pacotes-adicionados).
- Entenda as [dependências originais](/.docs/Pacotes%20Nodes.md) do template.
- Merge na branch `main` somente com pull request de `develop`.

## Ambientes

> [!TIP]
> A URL segue o seguinte formato, `https://<branch>--<repository>--<owner(org | user).aem.<"preview" | "live">`.

- **Preview**: [https://main--facilita-eds-ue--vilt-r-d.aem.live/](https://main--facilita-eds-ue--vilt-r-d.aem.page)
- **Live**: [https://main--facilita-eds-ue--vilt-r-d.aem.page/](https://main--facilita-eds-ue--vilt-r-d.aem.page)


## Prerequisites

- nodejs 18.3.x or newer
- AEM Cloud Service release 2024.8 or newer (>= `17465`)

## Local development

1. Create a new repository based on the `aem-boilerplate` template and add a mountpoint in the `fstab.yaml`
1. Add the [AEM Code Sync GitHub App](https://github.com/apps/aem-code-sync) to the repository
1. Install the [AEM CLI](https://github.com/adobe/helix-cli): `npm install -g @adobe/aem-cli`
1. Start AEM Proxy: `aem up` (opens your browser at `http://localhost:3000`)
1. Open the `{repo}` directory in your favorite IDE and start coding :)
