'use server'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8758380465:AAGqNLIADg8xXtf_WRs5px6qwVPnYk0aeqc';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '1023274394';

export async function sendTelegramNotification(message: string) {
  try {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.warn('Telegram credentials not configured');
      return;
    }
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
      const errText = await response.text();
      console.error('Failed to send Telegram message:', errText);
      // Fallback: If Telegram rejected HTML entities, send as plain text
      if (errText.includes("can't parse entities")) {
        const plainText = message.replace(/<[^>]+>/g, '');
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: plainText,
          }),
        });
      }
    }
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
  }
}

export async function sendTelegramOrder(formData: FormData) {
  try {
    const message = formData.get('message') as string;
    const photo = formData.get('photo') as File | null;

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.warn('Telegram credentials not configured');
      return;
    }

    let photoSent = false;

    if (photo && photo.size > 0) {
      try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
        const tgFormData = new FormData();
        tgFormData.append('chat_id', TELEGRAM_CHAT_ID);

        // Telegram caption limit is 1024 characters
        if (message.length <= 1000) {
          tgFormData.append('caption', message);
          tgFormData.append('parse_mode', 'HTML');
          tgFormData.append('photo', photo);

          const response = await fetch(url, {
            method: 'POST',
            body: tgFormData,
          });

          if (response.ok) {
            photoSent = true;
          } else {
            console.error('Failed to send Telegram photo with caption:', await response.text());
          }
        }

        // If caption was too long or sending photo with caption failed,
        // send full text message first, then send photo separately with a short caption
        if (!photoSent) {
          await sendTelegramNotification(message);

          const photoOnlyFormData = new FormData();
          photoOnlyFormData.append('chat_id', TELEGRAM_CHAT_ID);
          photoOnlyFormData.append('photo', photo);
          photoOnlyFormData.append('caption', '📸 إيصال التحويل المرفق بالطلب');

          const photoRes = await fetch(url, {
            method: 'POST',
            body: photoOnlyFormData,
          });

          if (!photoRes.ok) {
            console.error('Failed to send Telegram photo separately:', await photoRes.text());
          }
          photoSent = true;
        }
      } catch (photoErr) {
        console.error('Error uploading photo to Telegram:', photoErr);
      }
    }

    // Fallback: If no photo was provided or photo handling encountered an error, send message
    if (!photoSent) {
      await sendTelegramNotification(message);
    }
  } catch (error) {
    console.error('Error sending Telegram order:', error);
    try {
      const message = formData.get('message') as string;
      if (message) {
        await sendTelegramNotification(message);
      }
    } catch (e) {
      console.error('Ultimate fallback failed:', e);
    }
  }
}
