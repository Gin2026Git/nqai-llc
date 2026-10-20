export default async function handler(req, res) {
  try {
    const body = req.body || {};
    const confName = body.FriendlyName || body.friendlyName || "";
    const confSid = body.ConferenceSid || "";
    const event = body.StatusCallbackEvent || body.statusCallbackEvent || "";

    console.log("CONF-STATUS:", event, "Name:", confName, "SID:", confSid);

    // Only act when someone joins
    if (event !== 'participant-join' && event !== 'conference-start') {
      return res.status(200).send('ok');
    }

    const sid = process.env.TWILIO_ACCOUNT_SID;
    const tok = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_PHONE_NUMBER;
    const auth = 'Basic ' + Buffer.from(sid + ':' + tok).toString('base64');

    // List participants in this conference
    let participants = [];
    if (confSid) {
      const listRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Conferences/${confSid}/Participants.json`, {
        headers: { 'Authorization': auth }
      });
      const listData = await listRes.json();
      participants = listData.participants || [];
    }

    console.log("PARTICIPANTS COUNT:", participants.length);

    // If 2 humans in room, add translator bot as 3rd
    if (participants.length === 2) {
      const targetConf = confName || confSid;
      const botUrl = `https://nqai.llc/api/translator-bot?conf=${encodeURIComponent(targetConf)}`;
      console.log("ADDING BOT:", botUrl);

      await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Calls.json`, {
        method: 'POST',
        headers: { 'Authorization': auth, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          To: from,
          From: from,
          Url: botUrl
        })
      });
    }

    return res.status(200).send('ok');
  } catch (e) {
    console.log("CONF-STATUS ERROR:", e.message);
    return res.status(200).send('ok');
  }
}
