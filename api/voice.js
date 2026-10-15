module.exports = (req, res) => {
  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Thanks for calling NqAI LLC at 615-235-5215! Your AI interpreter is ready! Type any language, auto-detected!</Say>
  <Record maxLength="60" />
</Response>`);
};
