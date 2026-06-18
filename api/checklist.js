const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const KEY = "checklist-state";

async function kvGet() {
  const res = await fetch(`${KV_URL}/get/${KEY}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
  });
  const data = await res.json();
  // Upstash returns { result: "stringified JSON" | null }
  return data.result ? JSON.parse(data.result) : null;
}

async function kvSet(value) {
  const res = await fetch(`${KV_URL}/set/${KEY}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(JSON.stringify(value)),
  });
  return res.ok;
}

export default async function handler(req, res) {
  // CORS — allow the app and any agent to call this
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (!KV_URL || !KV_TOKEN) {
    return res.status(500).json({ error: "KV store not configured" });
  }

  // GET — read current state
  if (req.method === "GET") {
    const state = await kvGet();
    if (!state) {
      return res.status(200).json({
        checked: {},
        timestamps: {},
        lastInteraction: null,
      });
    }
    return res.status(200).json(state);
  }

  // PUT — replace entire state
  if (req.method === "PUT") {
    const body = req.body;
    if (!body || typeof body !== "object") {
      return res.status(400).json({ error: "Body must be a JSON object" });
    }
    const state = {
      checked: body.checked || {},
      timestamps: body.timestamps || {},
      lastInteraction: body.lastInteraction || new Date().toISOString(),
    };
    await kvSet(state);
    return res.status(200).json(state);
  }

  // PATCH — toggle specific items or bulk update
  // Body: { check: ["s1-i1", "s1-i2"], uncheck: ["s3-i1"] }
  if (req.method === "PATCH") {
    const body = req.body;
    let state = (await kvGet()) || {
      checked: {},
      timestamps: {},
      lastInteraction: null,
    };
    const now = new Date().toISOString();

    if (body.check && Array.isArray(body.check)) {
      for (const id of body.check) {
        state.checked[id] = true;
        state.timestamps[id] = now;
      }
    }
    if (body.uncheck && Array.isArray(body.uncheck)) {
      for (const id of body.uncheck) {
        delete state.checked[id];
        delete state.timestamps[id];
      }
    }
    if (body.reset === true) {
      state = { checked: {}, timestamps: {}, lastInteraction: now };
    }

    state.lastInteraction = now;
    await kvSet(state);
    return res.status(200).json(state);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
