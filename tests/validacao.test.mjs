import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const app=readFileSync(new URL("../src/App.jsx",import.meta.url),"utf8");
const workflow=readFileSync(new URL("../.github/workflows/validacao-v37.yml",import.meta.url),"utf8");
test("15 seções canônicas e posições 9, 10, 13",()=>{
  const match=app.match(/const HEAD=(\[[^;]+\]);/);
  assert.ok(match,"Cabeçalhos não encontrados");
  const heads=JSON.parse(match[1]);
  assert.equal(heads.length,15);
  assert.match(heads[8],/EXAME FÍSICO/);
  assert.match(heads[9],/HISTÓRIA DA DOENÇA ATUAL/);
  assert.match(heads[12],/CONDUTA INFECTOLÓGICA/);
});
test("documento institucional mantém 14 divisórias, Calibri 10 e rodapé",()=>{
  assert.match(app,/border:i\?/);
  assert.match(app,/BorderStyle\.SINGLE/);
  assert.match(app,/font:"Calibri",size:20/);
  assert.match(app,/INFECTO IA – PARECER CLÍNICO PARA REVISÃO MÉDICA/);
});
test("limite e bloqueio de parecer vazio",()=>{
  assert.match(app,/if\(count>830\)/);
  assert.match(app,/fields\.every\(x=>!x\.trim\(\)\)/);
});
test("importação Word e exportação DOCX presentes",()=>{
  assert.match(app,/mammoth\.extractRawText/);
  assert.match(app,/Packer\.toBlob\(doc\)/);
  assert.match(app,/\.docx/);
});
test("workflow instala, testa, compila e arquiva artefato",()=>{
  assert.match(workflow,/npm install/);
  assert.match(workflow,/npm run build/);
  assert.match(workflow,/upload-artifact/);
});
