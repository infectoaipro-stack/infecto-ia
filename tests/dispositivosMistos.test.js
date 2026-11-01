import test from "node:test";
import assert from "node:assert/strict";
import { validarParecer } from "../src/validacao/validarParecer.js";

// Casos sintéticos: não usar dados reais.
const campos = Array(15).fill("REGISTRO FICTÍCIO");
campos[6] = "Sem uso de antimicrobianos documentado.";
campos[7] = "CVC presente, sítio avaliado. SVD ausente.";
campos[12] = "Sem antimicrobianos em uso.";
const antimicrobianos = [{situacao:"sem_uso_documentado"}];

test("dispositivos distintos: CVC presente e SVD ausente não são contraditórios", () => {
 const dispositivos = [
  {situacao:"presente",tipo:"CVC",avaliacao:"Sítio avaliado"},
  {situacao:"ausente",tipo:"SVD"}
 ];
 const r = validarParecer({campos,dispositivos,antimicrobianos});
 assert.equal(r.pendencias.some(p=>p.codigo==="DISPOSITIVO_SITUACAO_CONTRADITORIA"),false);
 assert.equal(r.pendencias.some(p=>p.codigo==="DISPOSITIVO_CONTRADICAO_TEXTO"),false);
});

test("mesmo tipo presente e ausente deve exigir revisão", () => {
 const dispositivos = [
  {situacao:"presente",tipo:"CVC",avaliacao:"Sítio avaliado"},
  {situacao:"ausente",tipo:"CVC"}
 ];
 const r=validarParecer({campos,dispositivos,antimicrobianos});
 assert.ok(r.pendencias.some(p=>p.codigo==="DISPOSITIVO_SITUACAO_CONTRADITORIA"));
});
