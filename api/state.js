import { Redis } from "@upstash/redis";

const KEY = "hidrostal_costos_tablero_v1";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  let redis;
  try {
    redis = Redis.fromEnv();
  } catch (err) {
    return res.status(500).json({
      error: "Redis no configurado. Faltan variables KV_REST_API_URL / KV_REST_API_TOKEN."
    });
  }

  try {
    if (req.method === "GET") {
      const data = await redis.get(KEY);
      return res.status(200).json({
        state: data?.state || null,
        updatedAt: data?.updatedAt || null
      });
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      if (!body || !body.state || typeof body.state !== "object") {
        return res.status(400).json({ error: "Payload inválido: falta el objeto state." });
      }
      const payload = {
        state: body.state,
        updatedAt: new Date().toISOString()
      };
      await redis.set(KEY, payload);
      return res.status(200).json(payload);
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Error interno" });
  }
}
