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
  const SEMAFOROS = {
    verde: "VERDE — INFORMAÇÕES SUFICIENTES",
    amarelo: "AMARELO — INFORMAÇÕES INCOMPLETAS",
    vermelho: "VERMELHO — AUSÊNCIA CRÍTICA OU INCONSISTÊNCIA"
  };

  const semaforoCadastral = campos[0].trim()
    ? SEMAFOROS.amarelo
    : SEMAFOROS.vermelho;

  const semaforoClinico = [2, 8, 9].some(
    (indice) => !campos[indice].trim()
  )
    ? SEMAFOROS.vermelho
    : SEMAFOROS.amarelo;
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
          <div style={{
            border: "1px solid #ccc",
            padding: "12px",
            marginBottom: "16px",
            borderRadius: "6px"
          }}>
            <h3>PRÉ-VALIDAÇÃO DO PARECER</h3>
            <p>CADASTRAL: {semaforoCadastral}</p>
            <p>CLÍNICO: {semaforoClinico}</p>
            <p>
              Verificação preliminar de preenchimento.
              Não substitui a validação médica.
            </p>
          </div>
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
              <h2>MINUTA PARA REVISÃO MÉDICA</h2>

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
