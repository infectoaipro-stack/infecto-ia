import { useState } from "react";
import { auditarSiglas } from "./validacao/auditarSiglas.js";
import { validarParecer } from "./validacao/validarParecer.js";
import { TOPICOS_V41, VERSAO_PROTOCOLO, formatarAntimicrobianos, validarBlocoZeroV41 } from "./validacao/protocoloV41.js";

const TOPICOS = [
  {
    titulo: "DADOS DA PACIENTE/DO PACIENTE",
    orientacao:
      "Nome, idade, sexo, prontuário, atendimento, hospital, unidade, leito, origem, data da internação e avaliação."
  },
  {
    titulo: "PRECAUÇÕES",
    orientacao:
      "Registrar precauções indicadas e justificativas quando necessárias."
  },
  {
    titulo: "HIPÓTESES DIAGNÓSTICAS",
    orientacao:
      "Registrar diagnósticos e hipóteses separadamente, indicando incertezas."
  },
  {
    titulo: "COMORBIDADES",
    orientacao:
      "Registrar todas as comorbidades e alergias documentadas."
  },
  {
    titulo: "HÁBITOS",
    orientacao:
      "Registrar separadamente tabagismo, etilismo e adicção."
  },
  {
    titulo: "EXAMES COMPLEMENTARES",
    orientacao:
      "Laboratório, imagens, função renal, culturas, antibiogramas e respectivas datas."
  },
  {
    titulo: "ANTIMICROBIANOS ATUAIS E ANTERIORES",
    orientacao:
      "Separar atuais e anteriores. Informar nome, dose, via, intervalo, início, término quando documentado e justificativa."
  },
  {
    titulo: "DISPOSITIVOS INVASIVOS",
    orientacao:
      "Registrar dispositivos, localização, inserção, trocas e retirada quando documentadas."
  },
  {
    titulo: "MICROBIOLOGIA",
    orientacao:
      "Registrar os achados documentados, sinais vitais, suporte respiratório e hemodinâmico."
  },
  {
    titulo: "HISTÓRIA DA DOENÇA ATUAL",
    orientacao:
      "Descrever admissão, cronologia, evolução, tratamentos e situação atual."
  },
  {
    titulo: "EXAME FÍSICO",
    orientacao:
      "Correlacionar culturas, antibiogramas, sítios e quadro clínico."
  },
  {
    titulo: "JUSTIFICATIVA TERAPÊUTICA",
    orientacao:
      "Fundamentar escolhas e alterações terapêuticas documentadas."
  },
  {
    titulo: "CONDUTA INFECTOLÓGICA",
    orientacao:
      "Para cada antimicrobiano: nome, dose, via, intervalo, início documentado, justificativa, estado atual ou histórico e decisão. Não presumir administração."
  },
  {
    titulo: "OPINIÃO",
    orientacao:
      "Registrar análise crítica, recomendações e objetivo terapêutico."
  },
  {
    titulo: "REFERÊNCIAS",
    orientacao:
      "Registrar até cinco referências científicas pertinentes, com publicação e ano."
  }
];

export default function App() {
  const [novoParecer, setNovoParecer] = useState(false);
  const [campos, setCampos] = useState(
    Array(TOPICOS.length).fill("")
  );
  const [visualizar, setVisualizar] = useState(false);
  const [dispositivos, setDispositivos] = useState([]);
  const [antimicrobianos, setAntimicrobianos] = useState([]);
  const [populacao, setPopulacao] = useState("adulto");

  function atualizarCampo(indice, valor) {
    setCampos((anteriores) =>
      anteriores.map((campo, i) =>
        i === indice ? valor : campo
      )
    );
  }

  const textoParecer = TOPICOS.map((topico, indice) => {
    const conteudo = campos[indice].trim() || "NÃO INFORMADO";

    return `${topico.titulo}\n${conteudo}`;
  }).join("\n\n────────────────────────\n\n").toUpperCase();

  const auditoriaSiglas = auditarSiglas(textoParecer);
  const auditoriaEstrutural = validarParecer({campos, dispositivos, antimicrobianos});
  const auditoriaV41 = validarBlocoZeroV41({campos, antimicrobianos, populacao});
  const formatoV41 = formatarAntimicrobianos(antimicrobianos);
  const quantidadePalavras = textoParecer
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const conferencia = TOPICOS.map((t, i) => ({
    titulo: t.titulo,
    preenchido: Boolean(campos[i].trim())
  }));
  const preenchidos = conferencia.filter((t) => t.preenchido).length;
  const atb = campos[6].trim();
  const ausenciaATB = /(?:sem|nega|nenhum|não há|nao ha)\s+(?:uso\s+de\s+)?(?:antibióticos?|antimicrobianos?|atb)/i.test(atb);
  const criterios = [
    ["Nome", /(?:ceftriaxona|meropenem|vancomicina|cefepime|teicoplanina|ciprofloxacino|amoxicilina|azitromicina|piperacilina)/i.test(atb)],
    ["Dose", /\d+(?:[.,]\d+)?\s*(?:mg|g|ui)/i.test(atb)],
    ["Via", /\b(?:ev|iv|vo|im|oral|endovenosa|intravenosa)\b/i.test(atb)],
    ["Intervalo", /(?:\d+\s*\/\s*\d+\s*h|a cada\s+\d+\s*(?:h|horas))/i.test(atb)],
    ["Data de início", /\d{1,2}\/\d{1,2}(?:\/\d{2,4})?/.test(atb)],
    ["Justificativa", /(?:justificativa|indicação|devido a|tratamento de|por suspeita)/i.test(atb)]
  ];
  const fatos = [2, 3, 5, 7, 8, 9, 10, 11, 12, 13]
    .filter((i) => campos[i].trim())
    .map((i) => ({ numero: i + 1, titulo: TOPICOS[i].titulo, texto: campos[i].trim() }));
  const estiloBotao = {
    padding: "12px 20px",
    margin: "8px 8px 8px 0",
    cursor: "pointer",
    borderRadius: "6px",
    border: "1px solid #999"
  };

  return (
    <main
      style={{
        padding: "24px",
        maxWidth: "1000px",
        margin: "auto",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <h1>INFECTO IA</h1>
      <h2>Protótipo experimental — motor editorial V4.1</h2>

      <p>Sistema de Apoio à Infectologia</p>
      <p>Hospital Ruy Azeredo</p>

      <p>
        Protocolo V{VERSAO_PROTOCOLO} — 06/11/2026. Implementação experimental; NÃO HOMOLOGADO para uso clínico.
      </p>

      {!novoParecer ? (
        <section>
          <button
            style={estiloBotao}
            onClick={() => setNovoParecer(true)}
          >
            NOVO PARECER
          </button>
        </section>
      ) : (
        <section>
          <h2>Novo Parecer para Infectologia — V{VERSAO_PROTOCOLO}</h2>
          <label>MÓDULO POPULACIONAL: <select value={populacao} onChange={e=>setPopulacao(e.target.value)}><option value="adulto">ADULTO</option><option value="pediatria">PEDIATRIA</option><option value="neonatologia">NEONATOLOGIA</option></select></label>

          <p>
            Formulário de preenchimento e visualização
            de minuta para revisão médica.
          </p>
          <p
            style={{
              padding: "12px",
              backgroundColor: "#fff3cd",
              borderRadius: "6px"
            }}
          >
            AMBIENTE EM DESENVOLVIMENTO.
            NÃO INSERIR DADOS IDENTIFICÁVEIS DE
            PACIENTES REAIS NESTA VERSÃO.
            NÃO UTILIZAR PARA DECISÕES CLÍNICAS.
          </p>

          {TOPICOS.map((topico, indice) => (
            <div
              key={indice}
              style={{
                padding: "18px 0",
                borderBottom: "1px solid #d3d3d3"
              }}
            >
              <h3>
                {indice + 1}. {topico.titulo}
              </h3>

              <p style={{ color: "#555" }}>
                {topico.orientacao}
              </p>

              <textarea
                aria-label={topico.titulo}
                value={campos[indice]}
                onChange={(evento) =>
                  atualizarCampo(
                    indice,
                    evento.target.value
                  )
                }
                placeholder="Digite as informações documentadas..."
                rows={5}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px",
                  fontFamily: "Arial, sans-serif",
                  fontSize: "14px",
                  borderRadius: "5px",
                  border: "1px solid #aaa"
                }}
              />
            </div>
          ))}

          
          <fieldset style={{marginTop:24}}>
            <legend>CONFERÊNCIA ESTRUTURADA — DADOS FICTÍCIOS</legend>
            <p>Registrar cada dispositivo e antimicrobiano. Texto livre não substitui a conferência.</p>
            <h3>DISPOSITIVOS</h3>
            <button type="button" onClick={() => setDispositivos([{situacao:"ausente"}])}>AUSÊNCIA DOCUMENTADA</button>
            <button type="button" onClick={() => setDispositivos(ds => [...ds.filter(d => d.situacao !== "ausente"),{situacao:"presente",tipo:"",avaliacao:""}])}>ADICIONAR DISPOSITIVO</button>
            {dispositivos.map((d,i) => <div key={i}>
              <strong>Dispositivo {i+1}: {d.situacao}</strong>
              {d.situacao === "presente" && <>
                <input aria-label={"Tipo do dispositivo "+(i+1)} placeholder="Tipo e localização" value={d.tipo} onChange={e => setDispositivos(ds => ds.map((x,j) => i===j?{...x,tipo:e.target.value}:x))}/>
                <input aria-label={"Avaliação do dispositivo "+(i+1)} placeholder="Avaliação documentada" value={d.avaliacao} onChange={e => setDispositivos(ds => ds.map((x,j) => i===j?{...x,avaliacao:e.target.value}:x))}/>
              </>}
              <button type="button" onClick={() => setDispositivos(ds => ds.filter((_,j) => j!==i))}>REMOVER</button>
            </div>)}
            <h3>ANTIMICROBIANOS</h3>
            <button type="button" onClick={() => setAntimicrobianos([{situacao:"sem_uso_documentado"}])}>SEM USO DOCUMENTADO</button>
            <button type="button" onClick={() => setAntimicrobianos(as => [...as.filter(a => a.situacao !== "sem_uso_documentado"),{situacao:"em_uso",categoria:"atual",nome:"",dose:"",via:"",intervalo:"",inicio:"",termino:"",justificativa:""}])}>ADICIONAR ATB</button>
            {antimicrobianos.map((a,i) => <div key={i}>
              <strong>ATB {i+1}: {a.situacao}</strong>
              {a.situacao !== "sem_uso_documentado" && <><label>Categoria <select value={a.categoria||"atual"} onChange={e=>setAntimicrobianos(as=>as.map((x,j)=>i===j?{...x,categoria:e.target.value}:x))}><option value="atual">ATUAL</option><option value="anterior">ANTERIOR</option></select></label><label>Situação <select value={a.situacao||"em_uso"} onChange={e=>setAntimicrobianos(as=>as.map((x,j)=>i===j?{...x,situacao:e.target.value}:x))}><option value="em_uso">USO ATUAL DOCUMENTADO</option><option value="anterior">USO ANTERIOR DOCUMENTADO</option><option value="uso_nao_confirmado">USO NÃO CONFIRMADO</option></select></label></>}
              {a.situacao !== "sem_uso_documentado" && ["nome","dose","via","intervalo","inicio","termino","justificativa"].map(chave => <label key={chave}>{chave}: <input aria-label={"ATB "+(i+1)+" "+chave} value={a[chave]||""} onChange={e => setAntimicrobianos(as => as.map((x,j) => i===j?{...x,[chave]:e.target.value}:x))}/></label>)}
              <button type="button" onClick={() => setAntimicrobianos(as => as.filter((_,j) => j!==i))}>REMOVER</button>
            </div>)}
            <h4>PRÉVIA PADRÃO V4.1 — NÃO SUBSTITUI CONFERÊNCIA</h4><pre style={{whiteSpace:"pre-wrap"}}>{formatoV41.texto}</pre>
            <p>O texto acima é uma prévia editorial; conferir e transcrever no tópico 7 sem presumir prescrição.</p>
            <p>Protótipo: conferir também coerência entre campos estruturados, tópicos 7, 8 e 13, prescrição e prontuário antes da homologação.</p>
          </fieldset>

          <div style={{ marginTop: "24px" }}>
            <button
              style={estiloBotao}
              onClick={() => setVisualizar(!visualizar)}
            >
              {visualizar
                ? "OCULTAR MINUTA"
                : "VISUALIZAR MINUTA"}
            </button>

            <button
              style={estiloBotao}
              onClick={() => {
                setNovoParecer(false);
                setVisualizar(false);
              }}
            >
              VOLTAR
            </button>
          </div>

          {visualizar && (
            <section
              style={{
                marginTop: "24px",
                padding: "20px",
                border: "1px solid #ccc"
              }}
            >
              <h2>AUDITORIA EXPERIMENTAL — SEM VALIDAÇÃO CLÍNICA</h2>
              <p>Estrutura: {auditoriaEstrutural.status} — {auditoriaEstrutural.pendencias.length} pendências. A conferência estruturada não substitui a revisão da prescrição e do prontuário.</p>
              <h3>VALIDADOR V4.1 — {auditoriaV41.status}</h3><ul>{auditoriaV41.pendencias.map((p,i)=><li key={i}>{p.codigo}: {p.mensagem||"Revisar dado"}</li>)}</ul>
              <h3>PENDÊNCIAS E BLOQUEIOS ESTRUTURAIS</h3>
              {auditoriaEstrutural.pendencias.length === 0 ? <p>Nenhuma pendência estrutural detectada automaticamente. Sem validação clínica.</p> : (
                <ul>{auditoriaEstrutural.pendencias.map((p,i) => (
                  <li key={i}><strong>{p.gravidade.toUpperCase()} — {p.codigo}</strong> (tópico {p.topico}): {p.mensagem}</li>
                ))}</ul>
              )}
              <p>Siglas: {auditoriaSiglas.status} — {auditoriaSiglas.achados.length} alertas.</p>
              <ul>{auditoriaSiglas.achados.map((a,i) => <li key={i}>{a.codigo}: {a.sigla} {a.trecho || ""}</li>)}</ul>
              <p>Não há correção automática nem autorização para uso clínico.</p>
              <h2>PRÉ-VALIDAÇÃO EXPERIMENTAL — NÃO HOMOLOGADA</h2>
              <p>Conferência preliminar. Não integra o parecer institucional final.</p>
              <h3>BLOCO 1 — IDENTIFICAÇÃO E CONSISTÊNCIA DOCUMENTAL</h3>
              <p>Conferência estrutural dos dados fornecidos. Identidade e prontuário não são verificados automaticamente.</p>
              <p>Identificação (tópico 1): {campos[0].trim() ? "REGISTRO PRESENTE — VERIFICAR CONSISTÊNCIA" : "PENDENTE"}</p>
              <p>História clínica (tópico 10): {campos[9].trim() ? "REGISTRO PRESENTE — VERIFICAR CRONOLOGIA" : "PENDENTE"}</p>
              <h3>BLOCO 2 — TRIAGEM E CONCILIAÇÃO DE ANTIMICROBIANOS</h3>
              <table style={{width:"100%",borderCollapse:"collapse",textAlign:"left"}}>
                <thead><tr>{["NOME","DOSE","VIA","INTERVALO","INÍCIO INFORMADO","SITUAÇÃO"].map(x=><th key={x} style={{borderBottom:"1px solid #999",padding:6}}>{x}</th>)}</tr></thead>
                <tbody>{antimicrobianos.length ? antimicrobianos.map((a,i)=><tr key={i}>{[a.nome||"NÃO INFORMADO",a.dose||"NÃO INFORMADO",a.via||"NÃO INFORMADO",a.intervalo||"NÃO INFORMADO",a.inicio||"NÃO INFORMADO",a.situacao||"NÃO INFORMADO"].map((x,j)=><td key={j} style={{padding:6,borderBottom:"1px solid #ddd"}}>{x}</td>)}</tr>) : <tr><td colSpan={6}>ANTIMICROBIANOS NÃO CONFERIDOS</td></tr>}</tbody>
              </table>
              <p>Datas são declaradas, não verificadas; nenhum registro comprova administração. Pendências críticas exigem revisão humana.</p>
              <h3>BLOCO 3 — ANÁLISE CRÍTICA E PENDÊNCIAS DOCUMENTAIS</h3>
              <p>Conciliação automatizada parcial dos tópicos 7, 8 e 13; justificativa (12) e opinião (14) ainda exigem análise clínica independente.</p>
              <p>Alertas estruturais: {auditoriaEstrutural.pendencias.length}. Nenhum alerta equivale a aprovação clínica.</p>
              <h4>TRIAGEM TEXTUAL COMPLEMENTAR</h4>
              <p style={{color: atb ? "#8a5a00" : "#a00000"}}>
                {!atb ? "VERMELHO — CAMPO 7 NÃO PREENCHIDO" : ausenciaATB ? "AMARELO — AUSÊNCIA REFERIDA; CONFERIR PRESCRIÇÃO" : "AMARELO — REGISTRO ENCONTRADO; CONFERIR PRESCRIÇÃO"}
              </p>
              <p>Prescrição e administração não são confirmadas automaticamente.</p>
              {atb && <p>Registro do tópico 7: {atb}</p>}
              {atb && !ausenciaATB && (
                <ul>{criterios.map(([nome, ok]) => (
                  <li key={nome}>{nome}: {ok ? "IDENTIFICADO NO TEXTO — CONFERIR" : "NÃO IDENTIFICADO — CONFERIR"}</li>
                ))}</ul>
              )}
              <p>A identificação por palavras-chave não valida cada medicamento individualmente.</p>
              <h3>2. FATOS RELEVANTES</h3>
              <p style={{color: fatos.length ? "#8a5a00" : "#a00000"}}>
                {fatos.length ? "AMARELO — INFORMAÇÕES DISPONÍVEIS PARA REVISÃO MÉDICA" : "VERMELHO — SEM DADOS CLÍNICOS"}
              </p>
              <p>Registros clínicos documentados para revisão, sem interpretação automática:</p>
              <ul>{fatos.map((f) => <li key={f.numero}><strong>{f.numero}. {f.titulo}:</strong> {f.texto}</li>)}</ul>
              <h3>CONFERÊNCIA DOS 15 TÓPICOS — {preenchidos}/15 PREENCHIDOS</h3>
              <ol>{conferencia.map((t, i) => (
                <li key={i}>{t.titulo}: <strong style={{color: t.preenchido ? "#166534" : "#a00000"}}>{t.preenchido ? "PREENCHIDO" : "PENDENTE"}</strong></li>
              ))}</ol>
              <hr style={{border: 0, borderTop: "1px solid #d3d3d3", margin: "28px 0"}} />
              <h2>BLOCO 2 — MINUTA DO PARECER INFECTOLÓGICO</h2>

              <p>
                Palavras aproximadas: {quantidadePalavras}
              </p>

              {quantidadePalavras > 830 && (
                <p style={{ color: "#a00000" }}>
                  ATENÇÃO: TEXTO ACIMA DO LIMITE
                  DE 830 PALAVRAS DO PARECER FINAL.
                </p>
              )}

              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                  fontFamily: "Arial, sans-serif",
                  fontSize: "14px",
                  lineHeight: "1.6"
                }}
              >
                {textoParecer}
              </pre>

              <p>
                INFECTO IA – PARECER CLÍNICO
                PARA REVISÃO MÉDICA
              </p>

              <strong>
                MINUTA NÃO VALIDADA.
                APROVAÇÃO MÉDICA NÃO REALIZADA.
              </strong>
            </section>
          )}
        </section>
      )}
    </main>
  );
}
