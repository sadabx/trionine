const https = require('https');

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const data = body.payload.data;
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      console.error("Missing Keys");
      return { statusCode: 500, body: "Missing Keys" };
    }

    const message = `
🚀 *New Contact Form Submission*
--------------------------------
👤 *Name:* ${data.name}
📧 *Email:* ${data.email}
📝 *Subject:* ${data.subject}
💬 *Message:* ${data.message}
    `;

    const postData = JSON.stringify({
      chat_id: CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });

    // Send using native Node.js HTTPS (No install needed)
    return new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.telegram.org',
        port: 443,
        path: `/bot${BOT_TOKEN}/sendMessage`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': postData.length
        }
      }, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ statusCode: 200, body: "Sent!" });
        } else {
          resolve({ statusCode: res.statusCode, body: "Telegram Error" });
        }
      });

      req.on('error', (e) => {
        console.error(e);
        resolve({ statusCode: 500, body: "Internal Error" });
      });

      req.write(postData);
      req.end();
    });

  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: "Error" };
  }
};