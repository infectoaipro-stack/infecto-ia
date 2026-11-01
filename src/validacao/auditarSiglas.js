import catalogo from "./dicionarioSiglas.json" with { type: "json" };
// Auditoria editorial conservadora. Nunca altera prescricoes ou aprova clinicamente.
const normalizar = s => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("pt-BR");
const escapeRegex = s => s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
const palavra = s => new RegExp("(?<![\\p{L}\\p{N}])"+escapeRegex(s)+"(?![\\p{L}\\p{N}])","giu");
const ignorar = new Set(["EV","VO","IM","SC","D0"]); // via e posologia nao sao corrigidas automaticamente
export function auditarSiglas(texto = "") {
 const entrada=String(texto), normal=normalizar(entrada), achados=[];
 for(const item of catalogo.siglas) {
  const {sigla,definicao,classe}=item;
  if(classe==="comum" && !ignorar.has(sigla)) {
   // Nao converter termos com definicao ambigua ou varias alternativas.
   if(definicao.includes(" ou ") || definicao.includes("/")) continue;
   for(const match of normal.matchAll(palavra(normalizar(definicao)))) {
    achados.push({codigo:"SIGLA_USUAL_POR_REVISAR",sigla,trecho:entrada.slice(match.index,match.index+match[0].length),indice:match.index,gravidade:"editorial"});
   }
  }
  const ocorrencias=[...entrada.matchAll(palavra(sigla))];
  if(!ocorrencias.length) continue;
  if(classe==="rara") {
   const primeira=ocorrencias[0];
   const janela=normal.slice(Math.max(0,primeira.index-160),Math.min(normal.length,primeira.index+sigla.length+180));
   const definicaoBase=normalizar(definicao.replace(/\s*\([^)]*\)\s*$/,""));
   if(!janela.includes(definicaoBase)) achados.push({codigo:"SIGLA_RARA_SEM_DEFINICAO",sigla,indice:primeira.index,gravidade:"editorial"});
  }
  if(classe==="ambigua") achados.push({codigo:"SIGLA_AMBIGUA",sigla,indice:ocorrencias[0].index,gravidade:"editorial",mensagem:"Conferir contexto; nao substituir automaticamente."});
 }
 return {status:achados.length?"REVISAO_EDITORIAL":"SEM_ALERTAS_DO_DICIONARIO",validacaoClinica:false,achados,entradasDicionario:catalogo.siglas.length};
}
