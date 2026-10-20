// api/conf-status.js - FIXED SAFE - hello@nqai.llc
export default async function handler(req, res) {
  try {
    const body = req.body || {};
    const event = body.StatusCallbackEvent || body.statusCallbackEvent || "unknown";
    const confSid = body.ConferenceSid || "";
    console.log("CONF-STATUS:", event, "SID:", confSid);
    
    // Always return OK immediately - Never crash!
    return res.status(200).send("OK");
    
  } catch (e) {
    console.error("conf-status error:", e);
    return res.status(200).send("OK");
  }
}
