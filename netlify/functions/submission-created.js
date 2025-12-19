const fetch = require('node-fetch');

exports.handler = async (event) => {
  // 1. Parse the form data sent by Netlify
  const body = JSON.parse(event.body);
  const data = body.payload.data;

  // 2. Get your secret keys from Netlify Environment
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    console.error("Missing Telegram keys!");
    return { statusCode: 500, body: "Missing keys" };
  }

  // 3. Construct the Telegram Message
  const message = `
🚀 *New Contact Form Submission*
--------------------------------
👤 *Name:* ${data.name}
📧 *Email:* ${data.email}
📝 *Subject:* ${data.subject}
💬 *Message:* ${data.message}
  `;

  // 4. Send to Telegram API
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    return { statusCode: 200, body: "Message sent to Telegram" };
  } catch (error) {
    console.log("Error sending to Telegram:", error);
    return { statusCode: 500, body: "Error" };
  }
};