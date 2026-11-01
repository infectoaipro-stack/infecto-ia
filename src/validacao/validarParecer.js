// Validador deterministico preliminar: NAO realiza julgamento clinico.
// Os indices correspondem aos 15 topicos do protocolo INFECTO IA.
export function validarParecer({ campos = [], dispositivos = [], antimicrobianos = [] } = {}) {
  const pendencias = [];
  for (let i = 0; i < 15; i++) {
    if (!String(campos[i] ?? "").trim()) {
      pendencias.push({ codigo: "TOPICO_AUSENTE", topico: i + 1, gravidade: "pendente", mensagem: "Topico sem informacao documentada." });
    }
  }
  // Texto livre nao comprova avaliacao de dispositivo; exige registro estruturado.
  if (!Array.isArray(dispositivos) || dispositivos.length === 0) {
    pendencias.push({ codigo: "DISPOSITIVOS_NAO_CONFERIDOS", topico: 8, gravidade: "critica", mensagem: "Confirmar presença ou ausência de dispositivos e registrar avaliação." });
  } else {
    for (const [i, d] of dispositivos.entries()) {
      if (!["presente", "ausente"].includes(d?.situacao)) {
        pendencias.push({ codigo: "DISPOSITIVO_SEM_SITUACAO", topico: 8, indice: i, gravidade: "critica", mensagem: "Informar se dispositivo está presente ou ausente." });
      }
      if (d?.situacao === "presente" && (!String(d.tipo ?? "").trim() || !String(d.avaliacao ?? "").trim())) {
        pendencias.push({ codigo: "DISPOSITIVO_SEM_AVALIACAO", topico: 8, indice: i, gravidade: "critica", mensagem: "Dispositivo presente sem identificação ou avaliação documentada." });
      }
    }
  }
  if (!Array.isArray(antimicrobianos) || antimicrobianos.length === 0) {
    pendencias.push({ codigo: "ATB_NAO_CONFERIDOS", topico: 7, gravidade: "critica", mensagem: "Confirmar antimicrobianos em uso, anteriores ou ausência documentada." });
  } else {
    for (const [i, a] of antimicrobianos.entries()) {
      if (a?.situacao === "sem_uso_documentado") continue;
      for (const campo of ["nome", "dose", "via", "intervalo", "inicio"]) {
        if (!String(a?.[campo] ?? "").trim()) {
          pendencias.push({ codigo: "ATB_CAMPO_AUSENTE", topico: 7, indice: i, campo, gravidade: "critica", mensagem: "Campo obrigatorio do antimicrobiano não informado; conferir prescrição." });
        }
      }
    }
  }
  return {
    status: pendencias.some(p => p.gravidade === "critica") ? "BLOQUEADO" : pendencias.length ? "PENDENTE" : "PRONTO_PARA_REVISAO",
    validacaoClinica: false,
    pendencias
  };
}
