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
  let auth;
  
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    // Parse JSON string from environment variable
    try {
      const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
      auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });
    } catch (err) {
      throw new Error(
        `Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY: ${err.message}. ` +
        `Ensure the environment variable contains valid JSON.`
      );
    }
  } else {
    // Fall back to file-based approach
    auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
  }
  
  const client = await auth.getClient();
  return google.sheets({ version: "v4", auth: client });
}

// ── Gemini client ───────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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

// ── Start ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running → http://localhost:${PORT}`);
});
