# Sheet → Gemini Processor

A web app that reads question/answer pairs from a Google Sheet, processes each answer through Gemini, and writes the results back to a new tab.

## Setup

### 1. Get your Gemini API key

- Go to https://aistudio.google.com/apikey
- Create an API key
- You'll add this to your `.env` file

### 2. Set up Google Sheets API access

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Enable the **Google Sheets API**: APIs & Services → Library → search "Google Sheets API" → Enable
4. Create a **Service Account**: APIs & Services → Credentials → Create Credentials → Service Account
5. Create a key for the service account: click the account → Keys → Add Key → JSON
6. Download the JSON key file and save it as `service-account-key.json` in this project folder
7. **Share your Google Sheet** with the service account email (it looks like `name@project-id.iam.gserviceaccount.com`) — give it **Editor** access

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:
- `GEMINI_API_KEY` — your Gemini API key
- `GOOGLE_SERVICE_ACCOUNT_KEY_PATH` — path to the JSON file (default: `./service-account-key.json`)

### 4. Install & run

```bash
npm install
npm start
```

Open http://localhost:3000

## Deploying to Render.com

### 1. Push your code to GitHub

Make sure your repository is on GitHub and up to date.

### 2. Create a Web Service on Render

1. Log into [Render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node

### 3. Set Environment Variables

In the Render dashboard, add these environment variables:

| Variable | Value |
|----------|-------|
| `GEMINI_API_KEY` | Your Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey) |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | The entire contents of your `service-account-key.json` file as a single-line JSON string |

**Important**: For `GOOGLE_SERVICE_ACCOUNT_KEY`, copy the **entire JSON content** from your service account key file (everything inside the curly braces `{...}`).

### 4. Deploy

Click **"Create Web Service"** and Render will build and deploy your app!

## How to use

1. Paste your Google Sheet ID (from the URL: `docs.google.com/spreadsheets/d/{THIS_PART}/edit`)
2. Click **Load preview** to see your questions & answers
3. Write your prompt for Gemini (the question and answer are appended automatically)
4. Click **Process all answers**
5. Results are written to a new tab named `Processed_YYYY-MM-DD` in the same sheet

## Sheet format

Your sheet should have **2 columns**:

| Column A (Question)         | Column B (Answer)              |
|-----------------------------|--------------------------------|
| What is photosynthesis?     | It's when plants make food ... |
| Explain Newton's 3rd law    | For every action there is ...  |

The first row is treated as a header and skipped.

## Notes

- Uses Gemini 2.0 Flash (`gemini-2.0-flash`) for processing. Change the model in `server.js` if needed.
- Answers are processed sequentially to respect rate limits.
- The app streams progress updates to the UI via Server-Sent Events.
