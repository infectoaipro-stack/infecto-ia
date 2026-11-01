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
  // Limite editorial: nao considerar pronto um parecer acima de 830 palavras.
  const totalPalavras = campos.map(v => String(v ?? "")).join(" ").trim().split(/\s+/).filter(Boolean).length;
  if (totalPalavras > 830) {
    pendencias.push({ codigo: "LIMITE_PALAVRAS", gravidade: "critica", mensagem: "Conteudo ultrapassa 830 palavras; revisar antes de gerar parecer." });
  }
  // Barreiras conservadoras: registro estruturado nao pode contrariar texto.
  const normalizar = v => String(v ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const topico7 = normalizar(campos[6]);
  const topico8 = normalizar(campos[7]);
  const topico13 = normalizar(campos[12]);
  const semUso = antimicrobianos.some(a => a?.situacao === "sem_uso_documentado");
  const comUso = antimicrobianos.some(a => a?.situacao !== "sem_uso_documentado");
  if (semUso && comUso) {
    pendencias.push({ codigo: "ATB_SITUACAO_CONTRADITORIA", topico: 7, gravidade: "critica", mensagem: "Ausencia documentada e antimicrobiano registrado simultaneamente." });
  }
  if (semUso && /\b(em uso|uso atual|prescrito|recebe|mant[eé]r|iniciar|ceftriaxona|meropenem|vancomicina|piperacilina|linezolida)\b/.test(topico7 + " " + topico13)) {
    pendencias.push({ codigo: "ATB_CONTRADICAO_TEXTO", topico: 7, gravidade: "critica", mensagem: "Texto sugere antimicrobiano, mas registro estruturado declara ausencia; revisar manualmente." });
  }
  for (const [i, a] of antimicrobianos.entries()) {
    if (a?.situacao === "sem_uso_documentado" || !String(a?.nome ?? "").trim()) continue;
    const nome = normalizar(a.nome).trim();
    if (!topico7.includes(nome) || !topico13.includes(nome)) {
      pendencias.push({ codigo: "ATB_NAO_CONCILIADO", topico: 13, indice: i, gravidade: "critica", mensagem: "Nome do antimicrobiano estruturado deve ser conferido nos topicos 7 e 13." });
    }
    // Conferencia textual conservadora: a presenca do nome nao comprova posologia.
    // Alertar para revisao humana quando os dados estruturados nao aparecem na conduta.
    // Data informada no inventario precisa constar no historico (topico 7).
    // Nao presume D0 nem comprova administracao; apenas detecta omissao textual.
    const inicio = String(a?.inicio ?? "").trim();
    if (inicio && !String(campos[6] ?? "").includes(inicio)) {
      pendencias.push({ codigo: "ATB_INICIO_NAO_CONCILIADO", topico: 7, indice: i, campo: "inicio", gravidade: "critica", mensagem: "Data de inicio estruturada nao identificada no topico 7; conferir origem e evidencia da data." });
    }
    for (const campo of ["dose", "via", "intervalo"]) {
      const valor = normalizar(a?.[campo]).replace(/\s+/g, " ").trim();
      if (valor && !topico13.replace(/\s+/g, " ").includes(valor)) {
        pendencias.push({ codigo: "ATB_POSOLOGIA_NAO_CONCILIADA", topico: 13, indice: i, campo, gravidade: "critica", mensagem: "Conferir "+campo+" do antimicrobiano na conduta; divergencia textual ou formato diferente exige revisao." });
      }
    }
  }
  const ausenciaDispositivos = dispositivos.some(d => d?.situacao === "ausente");
  // Dispositivos diferentes podem legitimamente ter situacoes diferentes.
  // Bloquear apenas registros contraditorios do mesmo tipo identificado.
  const tiposPresentes = new Set(dispositivos.filter(d => d?.situacao === "presente" && String(d?.tipo ?? "").trim()).map(d => normalizar(d.tipo).trim()));
  for (const [i, d] of dispositivos.entries()) {
    if (d?.situacao === "ausente" && String(d?.tipo ?? "").trim() && tiposPresentes.has(normalizar(d.tipo).trim())) {
      pendencias.push({ codigo: "DISPOSITIVO_SITUACAO_CONTRADITORIA", topico: 8, indice: i, gravidade: "critica", mensagem: "Mesmo tipo de dispositivo registrado como presente e ausente; conferir identificacao e localizacao." });
    }
  }
  if (ausenciaDispositivos && /\b(cvc|cateter venoso central|sonda vesical|svd|tubo orotraqueal|tot|traqueostomia|tqt|picc)\b/.test(topico8)) {
    pendencias.push({ codigo: "DISPOSITIVO_CONTRADICAO_TEXTO", topico: 8, gravidade: "critica", mensagem: "Texto menciona dispositivo, mas registro estruturado declara ausencia; revisar contexto." });
  }
  for (const [i, d] of dispositivos.entries()) {
    if (d?.situacao !== "presente" || !String(d?.tipo ?? "").trim()) continue;
    if (!topico8.includes(normalizar(d.tipo).trim())) {
      pendencias.push({ codigo: "DISPOSITIVO_NAO_CONCILIADO", topico: 8, indice: i, gravidade: "critica", mensagem: "Dispositivo estruturado nao identificado no topico 8." });
    }
  }
  return {
    status: pendencias.some(p => p.gravidade === "critica") ? "BLOQUEADO" : pendencias.length ? "PENDENTE" : "PRONTO_PARA_REVISAO",
    validacaoClinica: false,
    pendencias
  };
}
