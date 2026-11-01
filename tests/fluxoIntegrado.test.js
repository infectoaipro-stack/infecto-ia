import test from "node:test";
import assert from "node:assert/strict";
import {validarParecer} from "../src/validacao/validarParecer.js";
import {auditarSiglas} from "../src/validacao/auditarSiglas.js";

// Casos sintéticos: não contêm dados de pacientes.
const campos=Array.from({length:15},(_,i)=>"INFORMAÇÃO FICTÍCIA TÓPICO "+(i+1));
const dispositivos=[{situacao:"presente",tipo:"CVC",avaliacao:"SÍTIO SEM ALTERAÇÕES DOCUMENTADAS"}];
const antimicrobianos=[{situacao:"em_uso",nome:"ceftriaxona",dose:"1 g",via:"EV",intervalo:"24/24 h",inicio:"01/11/2026"}];

test("fluxo: dados estruturados completos não equivalem a homologação clínica",()=>{
 const r=validarParecer({campos,dispositivos,antimicrobianos});
 assert.equal(r.status,"PRONTO_PARA_REVISAO");
 assert.equal(r.validacaoClinica,false);
});
test("fluxo: dose ausente bloqueia mesmo com os 15 tópicos preenchidos",()=>{
 const r=validarParecer({campos,dispositivos,antimicrobianos:[{...antimicrobianos[0],dose:""}]});
 assert.equal(r.status,"BLOQUEADO");
 assert.ok(r.pendencias.some(p=>p.campo==="dose"));
});
test("fluxo: dispositivo sem avaliação bloqueia",()=>{
 const r=validarParecer({campos,dispositivos:[{situacao:"presente",tipo:"CVC"}],antimicrobianos});
 assert.equal(r.status,"BLOQUEADO");
});
test("fluxo: ausência de conferência estruturada bloqueia apesar do texto livre",()=>{
 const r=validarParecer({campos});
 assert.equal(r.status,"BLOQUEADO");
 assert.ok(r.pendencias.some(p=>p.codigo==="ATB_NAO_CONFERIDOS"));
});
test("fluxo: sigla rara sem definição sinalizada independentemente da estrutura",()=>{
 const r=auditarSiglas("MRSA isolado em cultura fictícia.");
 assert.ok(r.achados.some(a=>a.codigo==="SIGLA_RARA_SEM_DEFINICAO"&&a.sigla==="MRSA"));
 assert.equal(r.validacaoClinica,false);
});
test("fluxo: ambiguidade de IRA requer revisão editorial",()=>{
 const r=auditarSiglas("IRA em avaliação.");
 assert.ok(r.achados.some(a=>a.codigo==="SIGLA_AMBIGUA"&&a.sigla==="IRA"));
});
