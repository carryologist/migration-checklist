import Redis from "ioredis";

const KEY = "checklist-state";
let redis;

function getRedis() {
  if (!redis) {
    const url = process.env.KV_URL || process.env.KV_REDIS_URL;
    if (!url) throw new Error("No Redis URL configured");
    redis = new Redis(url, { lazyConnect: true, tls: { rejectUnauthorized: false } });
  }
  return redis;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  let r;
  try {
    r = getRedis();
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }

  // GET — read current state
  if (req.method === "GET") {
    const raw = await r.get(KEY);
    if (!raw) {
      return res.status(200).json({ checked: {}, timestamps: {}, lastInteraction: null });
    }
    return res.status(200).json(JSON.parse(raw));
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
    await r.set(KEY, JSON.stringify(state));
    return res.status(200).json(state);
  }

  // PATCH — toggle specific items or bulk update
  if (req.method === "PATCH") {
    const body = req.body;
    const raw = await r.get(KEY);
    let state = raw ? JSON.parse(raw) : { checked: {}, timestamps: {}, lastInteraction: null };
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
    await r.set(KEY, JSON.stringify(state));
    return res.status(200).json(state);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
