'use server'

const TELEGRAM_BOT_TOKEN = '8758380465:AAGqNLIADg8xXtf_WRs5px6qwVPnYk0aeqc';
const TELEGRAM_CHAT_ID = '1023274394';

export async function sendTelegramNotification(message: string) {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });
    
    if (!response.ok) {
      console.error('Failed to send Telegram message:', await response.text());
    }
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
  }
}
