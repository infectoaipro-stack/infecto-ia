import { useState } from "react";

const TOPICOS = [
  {
    titulo: "DADOS DO PACIENTE",
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
    titulo: "HÁBITOS DO PACIENTE",
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
    titulo: "DISPOSITIVOS IMPLANTADOS",
    orientacao:
      "Registrar dispositivos, localização, inserção, trocas e retirada quando documentadas."
  },
  {
    titulo: "SINAIS, SINTOMAS E ACHADOS AO EXAME FÍSICO",
    orientacao:
      "Registrar os achados documentados, sinais vitais, suporte respiratório e hemodinâmico."
  },
  {
    titulo: "HISTÓRIA DA DOENÇA ATUAL (HDA)",
    orientacao:
      "Descrever admissão, cronologia, evolução, tratamentos e situação atual."
  },
  {
    titulo: "INTERPRETAÇÃO MICROBIOLÓGICA",
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
    titulo: "OPINIÃO DO INFECTOLOGISTA",
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

  function atualizarCampo(indice, valor) {
    setCampos((anteriores) =>
      anteriores.map((campo, i) =>
        i === indice ? valor : campo
      )
    );
  }

  const textoParecer = TOPICOS.map((topico, indice) => {
    const conteudo = campos[indice].trim() || "NÃO INFORMADO";

    return `${indice + 1}. ${topico.titulo}\n${conteudo}`;
  }).join("\n\n────────────────────────\n\n").toUpperCase();

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
      <h2>Versão 3.7</h2>

      <p>Sistema de Apoio à Infectologia</p>
      <p>Hospital Ruy Azeredo</p>

      <p>
        Protocolo canônico — revisão de 22/10/2026
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
          <h2>Novo Parecer para Infectologia</h2>

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
              <h2>BLOCO 1 — PRÉ-VALIDAÇÃO DO PARECER</h2>
              <p>Conferência preliminar. Não integra o parecer institucional final.</p>
              <h3>1. TRIAGEM DE ANTIMICROBIANOS</h3>
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
