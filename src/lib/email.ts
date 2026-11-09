import nodemailer from 'nodemailer';
import { sendTelegramNotification } from '@/app/actions/telegram';

interface SendOtpParams {
  toEmail: string;
  otpCode: string;
  actionTitle?: string;
}

/**
 * إنشاء ناقل البريد الإلكتروني (Nodemailer Transporter)
 */
function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * إرسال رمز التحقق (OTP) لتأكيد تغيير كلمة المرور
 */
export async function sendOtpEmail({ toEmail, otpCode, actionTitle = 'تأكيد تغيير كلمة المرور' }: SendOtpParams): Promise<{ success: boolean; error?: string }> {
  const targetEmail = toEmail || process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'yuri.glow.eg@gmail.com';
  const transporter = getTransporter();

  // إرسال نسخة عبر تيليجرام كطبقة أمان وسرعة إضافية
  try {
    const tgMsg = `🔐 <b>تنبيه أمان - Yuri Glow</b>\n\nتم طلب <b>${actionTitle}</b> للوحة التحكم.\n\nكود التحقق الخاص بك هو:\n<code>${otpCode}</code>\n\n⏳ هذا الكود صالح لمدة 10 دقائق فقط.\nإذا لم تكن أنت من قام بهذا الإجراء، يرجى الحذر.`;
    await sendTelegramNotification(tgMsg);
  } catch (tgErr) {
    console.error('Failed to send Telegram security alert:', tgErr);
  }

  if (!transporter || !targetEmail) {
    console.warn(`[EMAIL NOTICE] SMTP not fully configured (SMTP_USER/SMTP_PASS). OTP Code for testing is: [ ${otpCode} ]`);
    return {
      success: true,
      error: 'SMTP_NOT_CONFIGURED_FALLBACK_ACTIVE',
    };
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fdfcf0; margin: 0; padding: 20px; color: #2b3024; }
        .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.06); border: 1px solid #ebdcb9; }
        .header { background: #A88F48; padding: 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 22px; font-weight: bold; }
        .content { padding: 30px; line-height: 1.7; text-align: right; }
        .otp-box { background: #f8f6ea; border: 2px dashed #A88F48; border-radius: 10px; padding: 18px; text-align: center; margin: 24px 0; }
        .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #A88F48; margin: 0; font-family: monospace; }
        .footer { padding: 20px; text-align: center; font-size: 13px; color: #7f8c8d; border-top: 1px solid #f1f2f6; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Yuri Glow - لوحة التحكم</h1>
        </div>
        <div class="content">
          <h2 style="font-size: 18px; margin-top: 0; color: #2b3024;">طلب ${actionTitle}</h2>
          <p>مرحباً، لقد تلقينا طلباً لتأكيد كلمة المرور الخاصة بلوحة تحكم المتجر.</p>
          <p>يرجى استخدام رمز التأكيد التالي لإكمال العملية:</p>
          <div class="otp-box">
            <div class="otp-code">${otpCode}</div>
          </div>
          <p style="font-size: 14px; color: #e74c3c;">⚠️ هذا الرمز صالح لمدة <strong>10 دقائق</strong> فقط، ولا تشاركه مع أي شخص إطلاقاً.</p>
          <p style="font-size: 13px; color: #666;">إذا لم تكن أنت من قام بهذا الطلب، يرجى تجاهل هذا البريد والتأكد من أمان حسابك.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Yuri Glow. جميع الحقوق محفوظة.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Yuri Glow Security" <${process.env.SMTP_USER}>`,
      to: targetEmail,
      subject: `🔐 رمز تأكيد ${actionTitle} - Yuri Glow`,
      html: htmlContent,
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * إرسال إشعار فوري يفيد بنجاح تغيير كلمة المرور
 */
export async function sendPasswordChangedNotification(toEmail?: string): Promise<void> {
  const targetEmail = toEmail || process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'yuri.glow.eg@gmail.com';
  const timeFormatted = new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' });

  // تنبيه عبر تيليجرام
  try {
    const tgMsg = `✅ <b>تم تغيير كلمة مرور لوحة التحكم بنجاح!</b>\n\n🕒 الوقت: ${timeFormatted}\nإذا لم تكن أنت من قام بهذا التغيير، يرجى مراجعة لوحة التحكم فوراً!`;
    await sendTelegramNotification(tgMsg);
  } catch (e) {
    console.error('Failed to notify Telegram of password change:', e);
  }

  const transporter = getTransporter();
  if (!transporter || !targetEmail) return;

  const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fdfcf0; margin: 0; padding: 20px; color: #2b3024; }
        .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.06); border: 1px solid #ebdcb9; }
        .header { background: #27ae60; padding: 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 22px; font-weight: bold; }
        .content { padding: 30px; line-height: 1.7; text-align: right; }
        .alert-box { background: #eafaf1; border-right: 4px solid #27ae60; padding: 14px 18px; border-radius: 6px; margin: 20px 0; font-size: 14px; }
        .footer { padding: 20px; text-align: center; font-size: 13px; color: #7f8c8d; border-top: 1px solid #f1f2f6; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Yuri Glow - إشعار أمان</h1>
        </div>
        <div class="content">
          <h2 style="font-size: 18px; margin-top: 0; color: #2b3024;">تم تغيير كلمة المرور بنجاح</h2>
          <p>مرحباً، نود إعلامك بأنه تم تحديث كلمة المرور الخاصة بلوحة التحكم بنجاح.</p>
          <div class="alert-box">
            <strong>توقيت العملية:</strong> ${timeFormatted}
          </div>
          <p style="font-size: 13px; color: #e74c3c;">⚠️ إذا لم تكن أنت من قام بهذا التغيير، يرجى استعادة كلمة المرور فوراً عبر شاشة الدخول أو الاتصال بالدعم الفني.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Yuri Glow. جميع الحقوق محفوظة.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Yuri Glow Security" <${process.env.SMTP_USER}>`,
      to: targetEmail,
      subject: `✅ تم تغيير كلمة مرور لوحة التحكم بنجاح - Yuri Glow`,
      html: htmlContent,
    });
  } catch (error) {
    console.error('Error sending password change confirmation email:', error);
  }
}
