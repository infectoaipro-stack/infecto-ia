# Registro de consolidação — DNA canônico — 01/11/2026

**Estado: ADENDO PROPOSTO, SEM HOMOLOGAÇÃO CLÍNICA.** A fonte de autoridade continua sendo o Livro Mestre V3.6 de 17/10/2026. Não substituir regras existentes nem declarar integração ao Word original.

## Regras já existentes e obrigatórias
- Seção 12-A do Livro Mestre: uso de siglas consagradas, avaliação das pouco usuais, definição na primeira ocorrência quando autorizadas, desambiguação, autorização expressa do responsável clínico para incorporar novas siglas à lista canônica e esclarecimento no tópico 15.
- Não converter automaticamente doses, vias, intervalos, nomes de fármacos ou textos de prescrição.
- Preservar os 15 tópicos, pré-validação e revisão humana. Sem dados inventados.

## Propostas implementadas em código experimental
- Dicionário de 55 entradas em `src/validacao/dicionarioSiglas.json`, **candidatas** à revisão, não equivalentes a 55 autorizações clínicas.
- Fiscal editorial em `src/validacao/auditarSiglas.js` e testes isolados.
- Validador estrutural em `src/validacao/validarParecer.js` para tópicos, dispositivos e antimicrobianos.
- Interface experimental em `src/App.jsx` com conferência estruturada de dispositivos e antimicrobianos; sem conciliação automática com tópicos 7, 8 e 13.

## Lacunas impeditivas de homologação
1. Conferir individualmente 55 siglas, inclusive PCR, IRA, UTI, PCT, ATB, HD e D0, e obter autorização expressa do responsável clínico conforme seção 12-A.
2. Verificar definições na primeira ocorrência e aviso de sigla não autorizada; o fiscal atual **não implementa integralmente** o rito de autorização da seção 12-A.
3. Testar ponta a ponta a interface e divergências entre formulários, texto e prescrição.
4. Integrar somente após aprovação ao Word do Livro Mestre, criando versão nova e preservando o original; não tratar este registro como revisão do Word.
5. Não usar dados reais identificáveis nem liberar para decisão clínica antes da homologação.

**Rastreabilidade:** branch `feature/validador-clinico-v1`, PR #1; manter `main` intacta.
