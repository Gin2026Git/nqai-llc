module.exports = (req, res) => {
  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Thanks for texting NqAI LLC! 5 FREE texts live! Type any language, auto-detected! Reply HELP for help, STOP to opt-out.</Message>
</Response>`);
};
