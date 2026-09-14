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

export async function sendTelegramOrder(formData: FormData) {
  try {
    const message = formData.get('message') as string;
    const photo = formData.get('photo') as File | null;

    if (photo && photo.size > 0) {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
      const tgFormData = new FormData();
      tgFormData.append('chat_id', TELEGRAM_CHAT_ID);
      tgFormData.append('caption', message);
      tgFormData.append('parse_mode', 'HTML');
      tgFormData.append('photo', photo);

      const response = await fetch(url, {
        method: 'POST',
        body: tgFormData,
      });

      if (!response.ok) {
        console.error('Failed to send Telegram photo:', await response.text());
      }
    } else {
      await sendTelegramNotification(message);
    }
  } catch (error) {
    console.error('Error sending Telegram order:', error);
  }
}
