// INFECTO IA V4.1 — motor editorial, sem validação farmacológica automática.
export const VERSAO_PROTOCOLO = "4.1";
export const TOPICOS_V41 = Object.freeze([
"DADOS DA PACIENTE/DO PACIENTE","PRECAUÇÕES","HIPÓTESES DIAGNÓSTICAS","COMORBIDADES","HÁBITOS","EXAMES COMPLEMENTARES",
"ANTIMICROBIANOS ATUAIS E ANTERIORES","DISPOSITIVOS INVASIVOS","MICROBIOLOGIA","HISTÓRIA DA DOENÇA ATUAL",
"EXAME FÍSICO","JUSTIFICATIVA TERAPÊUTICA","CONDUTA INFECTOLÓGICA","OPINIÃO","REFERÊNCIAS"
]);
const valor = v => String(v ?? "").trim() || "NÃO INFORMADO";
const escapar = v => String(v ?? "").replace(/\s+/g," ").trim();
export function formatarAntimicrobianos(antimicrobianos = []) {
 const grupos = {ATUAL:[], ANTERIOR:[]};
 const alertas = [];
 for (const [indice,a] of antimicrobianos.entries()) {
  if (a?.situacao === "sem_uso_documentado") continue;
  const categoria = a?.categoria === "anterior" || a?.situacao === "anterior" ? "ANTERIOR" : "ATUAL";
  if (!["em_uso","anterior","uso_nao_confirmado"].includes(a?.situacao)) {
   alertas.push({codigo:"ATB_SITUACAO_NAO_CONFIRMADA",indice});
  }
  const usoNaoConfirmado = a?.situacao === "uso_nao_confirmado";
  let linha = "- " + valor(a?.nome) + " — DOSE: " + valor(a?.dose) + ". VIA: " + valor(a?.via) + ". INTERVALO: " + valor(a?.intervalo);
  linha += ". INÍCIO: " + valor(a?.inicio);
  if(categoria === "ANTERIOR") linha += ". TÉRMINO: " + valor(a?.termino);
  linha += ". JUSTIFICATIVA: " + valor(a?.justificativa) + ".";
  if(usoNaoConfirmado) linha += " USO NÃO CONFIRMADO.";
  grupos[categoria].push(linha);
 }
 return {texto:"ATUAL:\n"+(grupos.ATUAL.join("\n")||"NÃO INFORMADO")+"\n\nANTERIOR:\n"+(grupos.ANTERIOR.join("\n")||"NÃO INFORMADO"),alertas};
}
export function validarBlocoZeroV41({campos=[],antimicrobianos=[],populacao="adulto",listaDoses=null}={}) {
 const pendencias=[];
 const texto=String(campos[6]??"");
 if(!/^ATUAL\s*:/im.test(texto)||!/^ANTERIOR\s*:/im.test(texto))
  pendencias.push({codigo:"V41_CATEGORIAS_AUSENTES",topico:7,gravidade:"critica",mensagem:"Separar ATUAL e ANTERIOR."});
 if(/\b(?:dose padr[aã]o(?: institucional)?|posologia de refer[eê]ncia)\b/i.test(texto))
  pendencias.push({codigo:"V41_METALINGUAGEM_DOSE",topico:7,gravidade:"critica",mensagem:"Retirar rótulos de dose padrão do parecer."});
 if(!["adulto","pediatria","neonatologia"].includes(populacao))
  pendencias.push({codigo:"V41_POPULACAO_INVALIDA",gravidade:"critica",mensagem:"Selecionar módulo populacional correto."});
 for(const [indice,a] of antimicrobianos.entries()){
  if(a?.situacao==="sem_uso_documentado")continue;
  if(!["em_uso","anterior","uso_nao_confirmado"].includes(a?.situacao))
   pendencias.push({codigo:"V41_SITUACAO_INVALIDA",indice,topico:7,gravidade:"critica"});
  for(const campo of ["nome","dose","via","intervalo","justificativa"])
   if(!escapar(a?.[campo]))pendencias.push({codigo:"V41_DADO_NAO_INFORMADO",indice,campo,topico:7,gravidade:"pendente",mensagem:"Registrar NÃO INFORMADO no texto e conferir dado de origem."});
  if(a?.situacao==="uso_nao_confirmado" && !/USO NÃO CONFIRMADO/i.test(texto))
   pendencias.push({codigo:"V41_USO_NAO_CONFIRMADO_OMITIDO",indice,topico:7,gravidade:"critica"});
  if(a?.doseOrigem==="referencia" && !a?.doseConferida)
   pendencias.push({codigo:"V41_DOSE_REFERENCIA_PENDENTE",indice,topico:7,gravidade:"critica",mensagem:"Dose de referência não é prescrição confirmada."});
 }
 if(listaDoses===null)pendencias.push({codigo:"V41_LISTA_DOSES_NAO_VERIFICADA",topico:7,gravidade:"pendente",mensagem:"Lista interna não fornecida; não inferir dose institucional."});
 return {versao:VERSAO_PROTOCOLO,status:pendencias.some(x=>x.gravidade==="critica")?"BLOQUEADO":pendencias.length?"PENDENTE":"PRONTO_PARA_REVISAO",validacaoClinica:false,pendencias};
}
