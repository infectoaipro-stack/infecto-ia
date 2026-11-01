import test from "node:test";
import assert from "node:assert/strict";
import { validarParecer } from "../src/validacao/validarParecer.js";

const campos = Array(15).fill("Informação fictícia para teste");
const atb = [{ situacao: "sem_uso_documentado" }];

test("bloqueia quando dispositivos não foram conferidos", () => {
  const r = validarParecer({ campos, antimicrobianos: atb });
  assert.equal(r.status, "BLOQUEADO");
  assert.ok(r.pendencias.some(p => p.codigo === "DISPOSITIVOS_NAO_CONFERIDOS"));
});

test("bloqueia dispositivo presente sem avaliação", () => {
  const r = validarParecer({ campos, antimicrobianos: atb, dispositivos: [{ situacao: "presente", tipo: "CVC" }] });
  assert.equal(r.status, "BLOQUEADO");
});

test("bloqueia antibiótico com dose ausente", () => {
  const r = validarParecer({ campos, dispositivos: [{ situacao: "ausente" }], antimicrobianos: [{ nome: "ceftriaxona", via: "EV", intervalo: "24/24 h", inicio: "01/11/2026" }] });
  assert.ok(r.pendencias.some(p => p.campo === "dose"));
});

test("dados estruturados completos apenas permitem revisão humana", () => {
  const r = validarParecer({ campos, dispositivos: [{ situacao: "ausente" }], antimicrobianos: atb });
  assert.equal(r.status, "PRONTO_PARA_REVISAO");
  assert.equal(r.validacaoClinica, false);
});
