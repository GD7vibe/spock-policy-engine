export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET, DELETE, OPTIONS");

  if (req.method === "OPTIONS") return res.status(200).end();

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: "Supabase not configured" });
  }

  const headers = {
    "apikey": supabaseKey,
    "Authorization": `Bearer ${supabaseKey}`,
    "Content-Type": "application/json",
  };

  // DELETE a single record
  if (req.method === "DELETE") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "No id provided" });
    const response = await fetch(`${supabaseUrl}/rest/v1/analyses?id=eq.${id}`, {
      method: "DELETE",
      headers,
    });
    return res.status(response.ok ? 200 : 500).json({ success: response.ok });
  }

  // GET all records, newest first
  if (req.method === "GET") {
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/analyses?select=*&order=created_at.desc&limit=50`,
        { method: "GET", headers }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(JSON.stringify(data));
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
