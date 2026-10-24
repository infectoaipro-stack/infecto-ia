import { useState } from "react";

export default function App() {
  const [novoParecer, setNovoParecer] = useState(false);

  return (
    <main style={{
      padding: "30px",
      fontFamily: "Arial, sans-serif"
    }}>
      <h1>INFECTO IA</h1>
      <h2>Versão 3.7</h2>

      <p>Sistema de Apoio à Infectologia</p>
      <p>Hospital Ruy Azeredo</p>

      {!novoParecer ? (
        <button onClick={() => setNovoParecer(true)}>
          NOVO PARECER
        </button>
      ) : (
        <section>
          <h2>Novo Parecer Infectológico</h2>
          <p>Área de elaboração de pareceres.</p>

          <button onClick={() => setNovoParecer(false)}>
            VOLTAR
          </button>
        </section>
      )}
    </main>
  );
}
