// Auditoria editorial deterministica; nao substitui revisao humana.
// Dicionario inicial conservador. Expansoes so sao sugeridas em texto narrativo.
const termos = [
  {extenso:/\bhipertens[aã]o arterial sist[eê]mica\b/giu,sigla:"HAS"},
  {extenso:/\bdiabetes mellitus\b/giu,sigla:"DM"},
  {extenso:/\bdoen[cç]a renal cr[oô]nica\b/giu,sigla:"DRC"},
  {extenso:/\bventila[cç][aã]o mec[aâ]nica\b/giu,sigla:"VM"},
  {extenso:/\bcateter venoso central\b/giu,sigla:"CVC"},
  {extenso:/\bsonda vesical de demora\b/giu,sigla:"SVD"}
];
const raras = [{sigla:"CLABSI",definicao:/infec[cç][aã]o da corrente sangu[ií]nea associada a cateter central/iu}];
const ambiguas = new Set(["IRA"]); // insuficiencia renal ou respiratoria aguda
export function auditarSiglas(texto="") {
  const achados=[];
  const entrada=String(texto);
  for(const {extenso,sigla} of termos) {
    const ocorrencias=[...entrada.matchAll(extenso)];
    for(const o of ocorrencias) achados.push({codigo:"SIGLA_USUAL_POR_REVISAR",sigla,trecho:o[0],indice:o.index,gravidade:"editorial",mensagem:"Avaliar substituicao pela sigla consagrada; preservar clareza."});
  }
  for(const {sigla,definicao} of raras) {
    const re=new RegExp("\\b"+sigla+"\\b","g");
    const ocorrencias=[...entrada.matchAll(re)];
    if(ocorrencias.length && !definicao.test(entrada.slice(Math.max(0,ocorrencias[0].index-150),ocorrencias[0].index+180))) achados.push({codigo:"SIGLA_RARA_SEM_DEFINICAO",sigla,indice:ocorrencias[0].index,gravidade:"editorial"});
  }
  for(const sigla of ambiguas) {
    const re=new RegExp("\\b"+sigla+"\\b","g");
    if(re.test(entrada)) achados.push({codigo:"SIGLA_AMBIGUA",sigla,gravidade:"editorial",mensagem:"Verificar sentido clinico; nao substituir automaticamente."});
  }
  return {status:achados.length?"REVISAO_EDITORIAL":"SEM_ALERTAS_DO_DICIONARIO",validacaoClinica:false,achados};
}
