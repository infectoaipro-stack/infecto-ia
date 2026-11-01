import test from "node:test";
import assert from "node:assert/strict";
import {auditarSiglas} from "../src/validacao/auditarSiglas.js";
test("sinaliza termo extenso com sigla usual",()=>assert.ok(auditarSiglas("Hipertensão arterial sistêmica.").achados.some(a=>a.sigla==="HAS")));
test("nao sinaliza sigla usual isolada",()=>assert.equal(auditarSiglas("HAS e DRC.").achados.length,0));
test("exige definicao de sigla rara",()=>assert.ok(auditarSiglas("CLABSI confirmada.").achados.some(a=>a.codigo==="SIGLA_RARA_SEM_DEFINICAO")));
test("aceita sigla rara definida",()=>assert.equal(auditarSiglas("CLABSI (infecção da corrente sanguínea associada a cateter central).").achados.length,0));
test("sinaliza sigla ambigua",()=>assert.ok(auditarSiglas("IRA em investigação.").achados.some(a=>a.codigo==="SIGLA_AMBIGUA")));
