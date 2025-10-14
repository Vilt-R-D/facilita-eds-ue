import { exec } from "node:child_process";

const run = (cmd) => new Promise((resolve, reject) => exec(
  cmd,
  (error, stdout) => {
    if (error) reject(error);
    else resolve(stdout);
  }
));

// Encontra os nomes dos arquivos em "stage" e joga numa lista.
const changeset = await run('git diff --cached --name-only --diff-filter=ACMR');
const modifiedFiles = changeset.split('\n').filter(Boolean);

const modifledPartials = modifiedFiles.filter((file) => file.match(/(^|\/)_.*.json/));
// Se um dos arquivos modificados for _<bloco>.json(Arquivo configuração de bloco)
if (modifledPartials.length > 0) {
  // Execute o comando para os juntar nos arquivos "component-definition.json", "component-filters.json" e "component-models.json"
  // Em cada um dos três jsons, há referência para todos os _*.json's dentro de /blocks 
  const output = await run('npm run build:json --silent');
  console.log(output);
  // Adiciona os novos arquivos modificados no commit.
  await run('git add component-models.json component-definition.json component-filters.json');
}
