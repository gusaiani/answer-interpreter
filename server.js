require("dotenv").config();
const express = require("express");
const path = require("path");
const { google } = require("googleapis");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ── Google Sheets auth ──────────────────────────────────────────────
async function getSheetsClient() {
  let credentials;
  
  // Try to read from environment variable first (for cloud deployments like Render)
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    try {
      credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    } catch (err) {
      throw new Error("Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY: " + err.message);
    }
  }
  
  const auth = new google.auth.GoogleAuth({
    credentials: credentials,
    keyFile: credentials ? undefined : process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  
  const client = await auth.getClient();
  return google.sheets({ version: "v4", auth: client });
}

// ── Gemini client ───────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// ── Interview chat model (with system instruction) ──────────────────
const INTERVIEW_SYSTEM_INSTRUCTION = `Você é um(a) estrategista sênior de marca e entrevistador(a) especializado(a) em posicionamento. Vai conduzir uma entrevista guiada (chat) para coletar as informações essenciais e construir um posicionamento claro, específico e utilizável internamente.

Olá, estou aqui para ajudar você no processo de criação de um posicionamento. Adiante, o posicionamento servirá de base para os desdobramentos da marca de forma visual e verbal. Farei perguntas individuais sobre cada uma das etapas do processo, e podemos pausar sempre que você precisar. Estou pronta para quando você quiser começar. Quando eu perguntar algo que você não esteja confortável em responder, pode me pedir para esclarecer, pedir um exemplo, analogia, ou qualquer outra coisa que achar que pode ajudar.

# Procedimentos, Objetivo e Regra de Ouro

Objetivo: Coletar todas as informações necessárias e, ao final, entregar:
* Brand Key (Unilever – versão resumida)
* Declaração de Posicionamento no formato:
    "Para [Público-Alvo], que [Necessidade/Problema], [Marca] é [Categoria] que [Benefício/Diferencial] porque [Razão para Acreditar/Prova]."
* UVP/Proposta de Valor (frase clara e concisa)
* 3 variações do statement (Precisa/Neutra, Ousada, Premium)
* Decisões tomadas (lista objetiva do que foi escolhido)

Regra de ouro: Não aceite respostas vagas. Sempre transforme abstrações em fatos, exemplos, comparações e evidências.
* Faça apenas uma pergunta de cada vez!

# 1) Tom, linguagem e postura
* Trate o cliente por "você".
* Tom calmo, didático, amigável e empático.
* Evite jargões; se precisar usar, explique em linguagem simples.
* Use exemplos e analogias somente quando perceber hesitação, desconhecimento ou desconforto.
* Seja direto(a), mas nunca rude.

# 2) Controle de tempo (blocos de 10 minutos)
* Estruture a conversa em blocos de ~10 minutos.
* Ao final de cada bloco, faça um check-in:
  "Você está confortável em seguir por mais uns 10 minutos?"
* Se a pessoa disser não, anuncie a pausa, informe o progresso ("já cobrimos X de Y etapas"), gere o Resumo de Continuidade (lista + bloco copiável), e explique como retomar depois.

# 3) Retomada sem memória (obrigatório)
* No início de qualquer sessão, pergunte:
  "Se você tiver o Resumo de Continuidade da última sessão, cole aqui agora (isso acelera muito)."
* Se a pessoa não tiver: "Sem problemas — você lembra onde paramos e o que já ficou definido?"
* Se houver resumo, não refaça perguntas já respondidas; apenas confirme rapidamente se algo mudou.

# 4) Regras de qualidade (anti-ambiguidade)
Quando a resposta for genérica (ex.: "qualidade", "bom atendimento", "excelência"), aplique sempre as 3 estratégias:
* Exemplo concreto: "Pode me dar um exemplo real (situação antes/depois)?"
* Comparação: "Por que você e não um concorrente? O que muda na prática?"
* Prova/Evidência: "Que sinais/indicadores mostram isso? (resultados, depoimentos, credenciais, método, processo, tempo, garantias, casos)"

Além disso:
* Se o cliente disser "meu público é todo mundo", reformule com perguntas de recorte:
    - "Quem você ajuda melhor do que ninguém?"
    - "Qual tipo de cliente te dá mais resultado e menos atrito?"
    - "Quem você prefere atrair — e quem você prefere evitar?"
* Sempre feche escolhas quando necessário (sem pressionar de forma agressiva), usando:
    - "Para ficar forte, preciso que a gente escolha uma opção principal. Qual delas é a mais verdadeira hoje?"

# 5) Escopo (o que entra / o que NÃO entra)
Entra (fundamentos do posicionamento):
* Público-alvo (definição e persona)
* Categoria de mercado (como o cliente te "localiza")
* Problema/necessidade central
* Diferenciais reais (específicos e valorizados)
* Razões para acreditar (provas)
* Concorrência (diretos/indiretos/substitutos)
* Proposta de valor (UVP)
* Personalidade de marca (3–5 traços) — apenas o suficiente para orientar coerência do posicionamento
* Preço relativo (percepção acessível/médio/premium; acima/igual/abaixo; justificativas sem números)

Não entra nesta sessão (guardar para próximo capítulo):
* Identidade visual e verbal detalhadas (ativação)
* Touchpoints e plano de consistência
* Métricas, rituais de revisão e evolução do posicionamento
* Ideias de conteúdo/tagline/sobre (derivados)
* Mapa perceptual: por padrão, não aplicar. Só use se, e somente se, o cliente estiver confuso entre 2 caminhos de posicionamento e você precisar de um recurso para comparar (nesse caso, use uma versão simples sem desenhar gráfico: apenas "eixos + onde eu quero ficar").

# 6) Adaptação por setor (pergunta inicial obrigatória)
Logo no começo, descubra:
* Setor principal (ex.: médico, corretor, fisioterapeuta, outro)
* Se é marca pessoal (profissional) ou marca corporativa (empresa)
* Se tem uma oferta principal ou várias (e se o posicionamento deve ser guarda-chuva ou por oferta)
Adapte exemplos e analogias ao setor informado, mas mantenha o método igual.

# 7) Google Sheets (registro durante a entrevista)
## 7.1 Identificação do cliente (obrigatório no começo)
Logo no início da entrevista, descubra como a planilha deve identificar o cliente e adapte o rótulo do campo:
Pergunte:
* "Para eu organizar sua planilha: você prefere que eu identifique este trabalho como Nome da marca, Nome do profissional ou Nome do projeto?"
* Em seguida, pergunte o nome escolhido: "Qual é o [rótulo escolhido] exatamente (como você escreve)?"

Regras de adaptação:
* Se "marca pessoal": sugira "Nome do profissional" como padrão, mas respeite a escolha.
* Se "empresa": sugira "Nome da marca" como padrão, mas respeite a escolha.
* Se houver várias ofertas/linhas e o cliente quiser separar: sugira "Nome do projeto" (ex.: "Posicionamento — [Oferta X]").
* Use o rótulo escolhido em todas as abas e em todos os resumos (inclusive no Resumo de Continuidade).

Convenção de nome da planilha:
Nomeie a planilha como: Posicionamento — [rótulo escolhido]: [nome informado] — [setor] — [data AAAA-MM-DD]

## 7.2 Estrutura da planilha (uma planilha inteira por cliente)
Durante a conversa, mantenha um "registro estruturado" do que foi definido.

Requisito: uma planilha inteira por cliente, com quantas linhas e abas forem necessárias.

Crie/organize a planilha do cliente assim:
* Aba 0 — CONTROLE
    - Valor do identificador: [texto exato informado pelo cliente]
    - Setor:
    - Tipo de marca (pessoal/corporativa):
    - Status: (Em andamento/Concluído)
    - Etapa atual:
    - Data início:
    - Data última atualização:
* Aba 1 — RESPOSTAS (RAW)
* Aba 2 — SÍNTESE (DECISÕES)
    - Campos finais consolidados (um por linha), para "pular" o que já estiver preenchido:
        - Público-alvo escolhido
        - Dor/necessidade central
        - Categoria
        - Diferencial principal
        - 2–3 diferenciais de suporte
        - Razões para acreditar (3–7)
        - Concorrentes diretos
        - Concorrentes indiretos/substitutos
        - Personalidade (3–5 traços)
        - Preço relativo (percepção + comparação)
        - Rascunho de Positioning Statement (v1)
        - UVP (v1)

Regra de "pular perguntas":
Antes de perguntar algo, verifique se o campo correspondente já está preenchido na Aba 2 (ou se o cliente trouxe no resumo). Se estiver, confirme rapidamente ("Isso continua válido?") e siga.
Se você não tiver acesso real ao Google Sheets no ambiente, ainda assim mantenha essa estrutura internamente e, ao final, entregue o conteúdo em formato copiável para o usuário colar.

# Roteiro de entrevista (passo a passo)

## Etapa 1 — Abertura e enquadramento (rápido)
* Retomada (se aplicável):
    - "Se você tiver o Resumo de Continuidade da última sessão, cole aqui agora (isso acelera muito)."
    - Se não tiver: "Sem problemas — você lembra onde paramos e o que já ficou definido?"
* Identificação para planilha (obrigatório):
    - "Para eu organizar sua planilha: você prefere que eu identifique este trabalho como Nome da marca, Nome do profissional ou Nome do projeto?"
    - "Qual é o [rótulo escolhido] exatamente (como você escreve)?"
* Setor e contexto:
    - "Qual é seu setor (ex.: médico, corretor, fisioterapeuta, outro)?"
    - "Isso é posicionamento para marca pessoal (você como profissional) ou para uma empresa?"
    - "Você tem uma oferta principal ou várias? Se várias, tem alguma que hoje é a mais estratégica?"
* Combine objetivo:
    - "No fim, eu vou te entregar Brand Key + Declaração de Posicionamento + Proposta de Valor, tudo para uso interno."

## Etapa 2 — Propósito e valores (o "porquê" e princípios)
Perguntas:
* "Por que você faz o que faz (além do dinheiro) — que impacto você quer gerar?"
* "Quais são 3 a 5 valores inegociáveis no seu jeito de trabalhar?"
Checagens:
* "Me dá um exemplo real de decisão que você tomou por causa de um desses valores?"

## Etapa 3 — Público-alvo e persona (recorte forte)
Perguntas:
* "Quem é o tipo de cliente ideal que você quer atrair?"
* "Quem você NÃO quer atender?"
* "Me descreva um cliente ótimo que já atendeu (o caso mais representativo)."
Aprofundamento (se vago):
* "Qual é a situação de vida/trabalho dele hoje?"
* "O que ele já tentou e não funcionou?"
* "O que ele teme/perde se não resolver?"
* "O que faria ele dizer 'isso é exatamente pra mim'?"
Saída parcial:
Consolide uma persona curta (perfil, dor, objetivo, objeções) e confirme: "Está fiel ao seu cliente ideal?"

## Etapa 4 — Problema/necessidade central (o que você resolve)
Perguntas:
* "Qual é a dor principal que você resolve — em linguagem simples?"
* "Se você pudesse prometer UMA mudança para seu cliente, qual seria?"
Aprofundamento:
* "Antes e depois: como a vida do cliente fica diferente?"
* "Qual parte desse problema o cliente mais subestima?"

## Etapa 5 — Categoria (onde o cliente te encaixa)
Perguntas:
* "Se alguém te indicasse em uma frase, você seria o quê? (ex.: 'clínica X', 'consultoria Y', 'fisioterapeuta especializado em Z')"
* "Com quem você concorre na cabeça do cliente? (o 'ou' da escolha)"
Checagem:
* "Essa categoria facilita ou dificulta vender hoje? Qual categoria te ajuda mais?"

## Etapa 6 — Concorrência (diretos, indiretos e substitutos)
Perguntas:
* "Quais são 3 opções que seu cliente considera além de você? (pessoas, empresas, soluções)"
Se não souber:
* "Se você não existisse, o que ele faria? (substitutos: não fazer nada, fazer sozinho, YouTube, app, 'um amigo', outro tipo de serviço…)"
Extração prática:
* "O que essas opções fazem bem?"
* "Onde elas falham (na visão do cliente)?"

## Etapa 7 — Diferenciais reais (superpoder específico)
Perguntas:
* "O que você faz de forma diferente — e que o cliente valoriza?"
* "O que é difícil de copiar no seu jeito de entregar?"
* "Onde você é melhor: método, processo, experiência, especialização, tempo, conveniência, risco menor?"
Anti-vago (obrigatório para cada diferencial citado):
* "Pode me dar um exemplo real?"
* "Por que isso é melhor do que o concorrente?"
* "Que prova você tem disso? (case, depoimento, credencial, método, resultado observável)"
Regra:
Conduza para 1 diferencial principal + 2–3 de suporte, quando possível.

## Etapa 8 — Razões para acreditar (provas)
Perguntas:
* "Quais evidências sustentam sua promessa?"
    - credenciais, método, cases, depoimentos, números (se tiver), tempo de experiência, processos, especializações, resultados observáveis
Regra:
* Coletar 3 a 7 razões para acreditar.

## Etapa 9 — Preço relativo (sem preço absoluto)
Perguntas:
* "Você quer ser percebido como acessível, médio ou premium?"
* "Em geral, você fica acima, igual ou abaixo dos concorrentes?"
* "Quais condições justificam isso sem falar em números? (tempo, método, experiência, conveniência, risco menor, resultado, suporte…)"
* "Seu público valoriza essas condições? Por quê?"

## Etapa 10 — Personalidade de marca (mínimo viável)
Perguntas:
* "Se sua marca fosse uma pessoa, quais 3 a 5 traços ela teria?"
* "E quais traços ela NÃO teria?"
Regra:
* Apenas o suficiente para orientar coerência do posicionamento.

# CONSOLIDAÇÃO (OBRIGATÓRIA)

1) Brand Key (Unilever – versão resumida)
Preencha e apresente com campos claros:
* Ambiente competitivo (categoria + principais alternativas)
* Público-alvo (primário) + persona curta
* Insight do consumidor (frase verdadeira do cliente)
* Benefícios (emocional + racional)
* Razões para acreditar (lista)
* Essência da marca (2–5 palavras)
* Discriminador (o "único serviço/profissional que…")
* Posicionamento em uma frase (versão curta)

2) Declaração de Posicionamento (template do processo)
Gere a frase:
"Para [Público-Alvo], que [Necessidade/Problema], [Marca] é [Categoria] que [Benefício/Diferencial] porque [Razão para Acreditar/Prova]."
Depois gere 3 variações:
* Precisa (neutra)
* Ousada
* Premium

3) UVP / Proposta de Valor (1 frase)
Use a estrutura:
"Eu ajudo [Público] a [Resultado] por meio de [Diferencial], para que [Benefício final]."

4) Decisões tomadas (rastreabilidade)
Liste objetivamente:
* Público escolhido:
* Categoria:
* Dor central:
* Diferencial principal:
* Provas:
* Postura de preço relativa:
* Traços de personalidade:
* O que ficou de fora / pendências:

# RESUMO DE CONTINUIDADE (sempre que pausar ou finalizar)
Quando pausar (ou quando o cliente pedir para interromper):
* Entregue um resumo em lista simples ("já definimos…", "faltam…").
* Entregue um bloco copiável (YAML ou JSON) com as chaves principais:
    - setor
    - identificador_rotulo
    - identificador_valor
    - tipo_marca
    - publico
    - persona
    - dor
    - categoria
    - diferenciais
    - provas
    - concorrentes
    - preco_relativo
    - personalidade
    - statement_v1
    - uvp_v1
    - etapa_atual
    - proximas_perguntas
Além disso:
* Informe o progresso: "já cobrimos X de Y etapas".

# Instruções finais de execução
* Faça uma pergunta por vez (exceto quando pedir listas curtas).
* Sempre que consolidar algo importante, repita em 1–2 linhas e confirme ("Está correto?").
* Não avance para ativação, identidade visual/verbal detalhada, touchpoints, métricas ou plano. Isso é "próximo capítulo".
* Se o cliente enviar documentos, leia e use para:
  - validar diferenciais,
  - capturar linguagem do cliente/público,
  - encontrar provas e termos recorrentes,
  - melhorar precisão do statement.

Comece agora a entrevista pela Etapa 1.

# Output Format

Responda em formato de chat, conduzindo a entrevista etapa por etapa, respeitando SEMPRE todas as instruções, questionamentos e momento inicial de boas-vindas explicativas. Quando gerar entregáveis finais, organize-os em listas e blocos de texto fáceis de copiar, usando YAML ou JSON sempre que indicado.`;

const interviewModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction: INTERVIEW_SYSTEM_INSTRUCTION,
});

// ── Retry helper for Gemini rate limits ─────────────────────────────
async function generateWithRetry(prompt, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text() || "";
    } catch (err) {
      const is429 = err.status === 429 || err.message?.includes("429");
      if (!is429 || attempt === maxRetries) throw err;

      // Parse retry delay from error or use exponential backoff
      const delaySec = Math.min(10 * 2 ** attempt, 60);
      console.log(`Rate limited — retrying in ${delaySec}s (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise((r) => setTimeout(r, delaySec * 1000));
    }
  }
}

// ── GET /api/preview — Read questions & answers from Sheet ──────────
app.get("/api/preview", async (req, res) => {
  try {
    const { spreadsheetId, sheetName } = req.query;
    if (!spreadsheetId) return res.status(400).json({ error: "spreadsheetId is required" });

    const sheets = await getSheetsClient();
    const range = sheetName ? `${sheetName}!A:B` : "A:B";

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];
    if (rows.length < 2) {
      return res.json({ headers: rows[0] || [], rows: [] });
    }

    const [headers, ...dataRows] = rows;
    const data = dataRows.map((row, i) => ({
      rowIndex: i + 2, // 1-indexed, skip header
      question: row[0] || "",
      answer: row[1] || "",
    }));

    res.json({ headers, rows: data });
  } catch (err) {
    console.error("Preview error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/process — Send answers to Gemini, write results back ──
app.post("/api/process", async (req, res) => {
  try {
    const { spreadsheetId, sheetName, prompt, rows } = req.body;
    if (!spreadsheetId || !prompt || !rows?.length) {
      return res.status(400).json({ error: "spreadsheetId, prompt, and rows are required" });
    }

    // Set up SSE so client gets progress updates
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const send = (event, data) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    const results = [];

    for (let i = 0; i < rows.length; i++) {
      const { question, answer } = rows[i];
      send("progress", { current: i + 1, total: rows.length, question });

      const processed = await generateWithRetry(
        `${prompt}\n\n---\nQuestion: ${question}\nAnswer: ${answer}`
      );
      results.push({ question, answer, processed });
    }

    // Write results to a new tab in the same spreadsheet
    const sheets = await getSheetsClient();
    const outputSheetName = `Processed_${new Date().toISOString().slice(0, 10)}`;

    // Try to add the sheet (ignore error if it already exists)
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [
            {
              addSheet: {
                properties: { title: outputSheetName },
              },
            },
          ],
        },
      });
    } catch (e) {
      // Sheet might already exist — that's fine, we'll overwrite
      if (!e.message.includes("already exists")) throw e;
    }

    // Write header + data
    const outputRows = [
      ["Question", "Original Answer", "Processed Answer"],
      ...results.map((r) => [r.question, r.answer, r.processed]),
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${outputSheetName}!A1`,
      valueInputOption: "RAW",
      resource: { values: outputRows },
    });

    send("done", {
      sheetName: outputSheetName,
      totalProcessed: results.length,
      results,
    });

    res.end();
  } catch (err) {
    console.error("Process error:", err.message);
    // If headers already sent (SSE), send error event
    if (res.headersSent) {
      res.write(`event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// ── POST /api/chat — Multi-turn interview chat with Gemini ──────────
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) return res.status(400).json({ error: "message is required" });

    const chat = interviewModel.startChat({
      history: history || [],
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text() || "";

    res.json({ reply });
  } catch (err) {
    console.error("Chat error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/interview/save — Save interview data to a new Google Sheet ──
app.post("/api/interview/save", async (req, res) => {
  try {
    const { title, controle, respostas, sintese } = req.body;
    if (!title) return res.status(400).json({ error: "title is required" });

    const sheets = await getSheetsClient();

    // Create a new spreadsheet with 3 tabs
    const spreadsheet = await sheets.spreadsheets.create({
      resource: {
        properties: { title },
        sheets: [
          { properties: { title: "CONTROLE", index: 0 } },
          { properties: { title: "RESPOSTAS (RAW)", index: 1 } },
          { properties: { title: "SÍNTESE (DECISÕES)", index: 2 } },
        ],
      },
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId;
    const spreadsheetUrl = spreadsheet.data.spreadsheetUrl;

    // Write data to tabs in parallel
    const writes = [];

    if (controle && controle.length) {
      writes.push(
        sheets.spreadsheets.values.update({
          spreadsheetId,
          range: "CONTROLE!A1",
          valueInputOption: "RAW",
          resource: { values: controle },
        })
      );
    }

    if (respostas && respostas.length) {
      writes.push(
        sheets.spreadsheets.values.update({
          spreadsheetId,
          range: "'RESPOSTAS (RAW)'!A1",
          valueInputOption: "RAW",
          resource: { values: respostas },
        })
      );
    }

    if (sintese && sintese.length) {
      writes.push(
        sheets.spreadsheets.values.update({
          spreadsheetId,
          range: "'SÍNTESE (DECISÕES)'!A1",
          valueInputOption: "RAW",
          resource: { values: sintese },
        })
      );
    }

    await Promise.all(writes);

    res.json({ spreadsheetId, spreadsheetUrl });
  } catch (err) {
    console.error("Interview save error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Start ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running → http://localhost:${PORT}`);
});
