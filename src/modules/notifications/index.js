// notifications — outbound email/SMS stubs. Leaf module: depends on nothing.
const sent = [];

function sendEmail(to, subject, body) {
  const message = { channel: 'email', to, subject, body, at: new Date().toISOString() };
  sent.push(message);
  console.log(`[email → ${to}] ${subject}`);
  return message;
}

function sendSms(to, body) {
  const message = { channel: 'sms', to, body, at: new Date().toISOString() };
  sent.push(message);
  console.log(`[sms → ${to}] ${body}`);
  return message;
}

module.exports = { sendEmail, sendSms, sent };
