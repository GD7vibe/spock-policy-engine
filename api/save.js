export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: "Supabase not configured" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const response = await fetch(`${supabaseUrl}/rest/v1/analyses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Prefer": "return=representation",
      },
      body: JSON.stringify({
        domain:          body.domain          || null,
        policy_idea:     body.policy_idea     || null,
        incentive_score: body.incentive_score || null,
        status:          body.status          || null,
        incentive:       body.incentive       || null,
        consequences:    body.consequences    || null,
        refinement:      body.refinement      || null,
        implementation:  body.implementation  || null,
        monitoring:      body.monitoring      || null,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(data));
    return res.status(200).json({ success: true, id: data[0]?.id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
