const fetch = require('node-fetch');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  const { fileData, fileName } = JSON.parse(event.body);

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file: fileData,
        upload_preset: uploadPreset,
        public_id: fileName.split('.')[0] + '-' + Date.now()
      })
    });

    const result = await response.json();

    if (result.secure_url) {
      return {
        statusCode: 200,
        body: JSON.stringify({ url: result.secure_url })
      };
    } else {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: result })
      };
    }

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
