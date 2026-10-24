import { useState } from "react";
import mammoth from "mammoth/mammoth.browser";
import { Document, Packer, Paragraph, TextRun, BorderStyle, Footer, AlignmentType } from "docx";
import "./style.css";

const TOPICOS = ["DADOS DO PACIENTE","PRECAUÇÕES","HIPÓTESES DIAGNÓSTICAS","COMORBIDADES","HÁBITOS DO PACIENTE","EXAMES COMPLEMENTARES","ANTIMICROBIANOS ATUAIS E ANTERIORES","DISPOSITIVOS IMPLANTADOS","SINAIS, SINTOMAS E ACHADOS AO EXAME FÍSICO","HISTÓRIA DA DOENÇA ATUAL (HDA)","INTERPRETAÇÃO MICROBIOLÓGICA","JUSTIFICATIVA TERAPÊUTICA","CONDUTA INFECTOLÓGICA","OPINIÃO DO INFECTOLOGISTA","REFERÊNCIAS"];
const DRUGS = ["piperacilina/tazobactam","piperacilina-tazobactam","tazocin","meropenem","vancomicina","ceftriaxona","cefepime","teicoplanina","ciprofloxacino","azitromicina","amoxicilina","fluconazol","claritromicina","sulfametoxazol","trimetoprima"];
const normalize = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const wordCount = s => (s.trim().match(/\S+/g)||[]).length;
function parseSections(raw) {
  const lines=raw.replace(/\r/g,"").split("\n"); const fields=Array(15).fill("");let current=-1,matched=0;
  lines.forEach(line=>{
    const m=line.match(/^\s*(?:#{1,4}\s*)?(\d{1,2})\s*[.\-–:)]+\s*(.+?)\s*$/);
    if(m && Number(m[1])>=1 && Number(m[1])<=15 && normalize(m[2]).includes(normalize(TOPICOS[Number(m[1])-1]).slice(0,12))) {current=Number(m[1])-1;matched++;return;}
    if(current>=0)fields[current]+=(fields[current]?"\n":"")+line;
  });
  return matched>=5?{fields:fields.map(s=>s.trim()),matched}:{fields:null,matched};
}
function drugAudit(text) {
 const blocks=text.split(/\n|;|\.(?=\s+[A-ZÁÉÍÓÚ])/).map(s=>s.trim()).filter(Boolean);
 const found=[];
 for(const block of blocks)for(const drug of DRUGS)if(normalize(block).includes(normalize(drug))&&!found.some(x=>x.name===drug&&x.text===block)){
  const dose=/\b\d+(?:[,.]\d+)?\s*(?:mg|g|ui|milh(?:ão|oes|ões)\s*ui)\b/i.test(block);
  const route=/\b(EV|IV|VO|IM|oral|endovenosa|intravenosa)\b/i.test(block);
  const interval=/\b(?:\d{1,2}\s*\/\s*\d{1,2}\s*h|(?:a cada|de)\s*\d{1,2}\s*(?:h|horas)|\d{1,2}\s*em\s*\d{1,2}\s*h)\b/i.test(block);
  const start=/\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/.test(block);
  const rationale=/(?:por|devido|indica|suspeita|tratamento|pneumonia|infec|sepse|tuberculose)/i.test(block);
  found.push({name:drug,text:block,dose,route,interval,start,rationale});
 }
 return found;
}
export default function App(){
 const [fields,setFields]=useState(Array(15).fill(""));const [raw,setRaw]=useState("");const [notice,setNotice]=useState("");const [preview,setPreview]=useState(false);const [approved,setApproved]=useState(false);
 const filled=fields.filter(x=>x.trim()).length;
 const content=TOPICOS.map((t,i)=>`${i+1}. ${t}\n${fields[i].trim()||"NÃO INFORMADO"}`).join("\n\n────────────────────────\n\n").toUpperCase();
 const count=wordCount(content);const audit=drugAudit(fields[6]+"\n"+fields[12]);
 const setField=(i,v)=>{setFields(old=>old.map((x,j)=>i===j?v:x));setApproved(false)};
 function importText(text){setRaw(text);const parsed=parseSections(text);if(parsed.fields){setFields(parsed.fields);setNotice(`Foram reconhecidos ${parsed.matched} títulos. Revise cada campo: importação não significa validação.`)}else{setNotice("Não foi possível distribuir automaticamente: texto mantido abaixo para revisão e cópia manual. Nenhuma informação foi inventada.")}setApproved(false)}
 async function upload(e){const file=e.target.files?.[0];if(!file)return;try{if(file.name.toLowerCase().endsWith(".docx")){const result=await mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()});importText(result.value)}else if(file.name.toLowerCase().endsWith(".txt"))importText(await file.text());else setNotice("Formato não aceito: use DOCX ou TXT.");}catch(err){setNotice("Falha ao ler arquivo: "+err.message)}e.target.value=""}
 async function exportWord(){try{
 const paragraphs=[new Paragraph({text:">>>>>>>> PARECER DA INFECTOLOGIA <<<<<<<<",alignment:AlignmentType.CENTER,spacing:{after:180},children:[new TextRun({text:">>>>>>>> PARECER DA INFECTOLOGIA <<<<<<<<",bold:true})]})];
 TOPICOS.forEach((t,i)=>{paragraphs.push(new Paragraph({children:[new TextRun({text:`${i+1}. ${t}`,bold:true})],border:i?{top:{color:"D3D3D3",style:BorderStyle.SINGLE,size:6,space:7}}:undefined,spacing:{before:120,after:70}}));paragraphs.push(new Paragraph({text:(fields[i].trim()||"NÃO INFORMADO").toUpperCase(),spacing:{after:100}}))});
 const doc=new Document({styles:{default:{document:{run:{font:"Calibri",size:20}}}},sections:[{children:paragraphs,footers:{default:new Footer({children:[new Paragraph({text:"INFECTO IA – PARECER CLÍNICO PARA REVISÃO MÉDICA",alignment:AlignmentType.CENTER})]})}}]});
 const blob=await Packer.toBlob(doc);const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="parecer_infecto_ia_teste.docx";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setNotice("Arquivo Word gerado. Documento não representa aprovação médica.");}
 catch(e){setNotice("Erro na exportação: "+e.message)}
 }
 return <main><h1>INFECTO IA <small>V3.7 · TESTE</small></h1><p>Ambiente experimental — utilize exclusivamente dados sintéticos. Não inserir informações identificáveis de pacientes reais.</p>
 <section><h2>1. Importação do caso</h2><label>Importar DOCX ou TXT <input type="file" accept=".docx,.txt" onChange={upload}/></label><p>Ou cole abaixo um parecer com tópicos numerados de 1 a 15:</p><textarea value={raw} onChange={e=>setRaw(e.target.value)} rows={6} placeholder="Cole um caso sintético..."/><button onClick={()=>importText(raw)}>Interpretar e distribuir tópicos</button><p role="status">{notice}</p></section>
 <section><h2>2. Revisão dos 15 tópicos ({filled}/15)</h2>{TOPICOS.map((t,i)=><label key={i}><strong>{i+1}. {t}</strong><textarea rows={3} value={fields[i]} onChange={e=>setField(i,e.target.value)} placeholder="NÃO INFORMADO — preencher apenas com dados documentados"/></label>)}</section>
 <section><h2>3. Pré-validação (fora do parecer)</h2><p><strong>Cadastro e clínica:</strong> {filled===15?"15 tópicos preenchidos; conferir conteúdo":"Pendências: "+(15-filled)+" tópico(s) sem conteúdo"}.</p><p><strong>Limite:</strong> {count}/830 palavras {count>830?"— ACIMA DO LIMITE":""}</p><h3>Triagem de antimicrobianos — por ocorrência textual</h3>{audit.length?audit.map((a,i)=><article key={i}><strong>{a.name}</strong><p>{a.text}</p><p>{[["Dose",a.dose],["Via",a.route],["Intervalo",a.interval],["Início",a.start],["Justificativa",a.rationale]].map(([name,ok])=>`${name}: ${ok?"identificado":"PENDENTE"}`).join(" · ")}</p></article>):<p>Nenhum antimicrobiano reconhecido automaticamente. Conferir manualmente.</p>}<p>A detecção é textual, não verifica prescrição, administração, adequação clínica, função renal ou indicação individual.</p></section>
 <section><h2>4. Prévia e Word</h2><button onClick={()=>setPreview(!preview)}>{preview?"Ocultar":"Visualizar"} parecer</button><label className="check"><input type="checkbox" checked={approved} onChange={e=>setApproved(e.target.checked)}/> Confirmo revisão médica dos dados deste teste (não equivale a assinatura).</label><button onClick={exportWord}>Exportar Word para revisão</button>{preview&&<pre>{content}</pre>}<p>Exportação disponível mesmo com pendências, sempre identificada no rodapé como documento para revisão médica.</p></section>
 </main>
}