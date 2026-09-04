const https = require('https');

const botToken = '8758380465:AAGqNLIADg8xXtf_WRs5px6qwVPnYk0aeqc';
const chatId = '1023274394';
const text = encodeURIComponent('Test Message');

const url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${text}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(data);
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
