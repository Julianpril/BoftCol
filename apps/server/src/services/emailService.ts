import nodemailer from 'nodemailer';
import { config } from '../config.js';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

export interface ApprovalEmailData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  printCode: string;
  totalPrice: number;
  photoCount: number;
}

export async function sendApprovalEmail(data: ApprovalEmailData): Promise<void> {
  const { customerName, customerEmail, orderId, printCode, totalPrice, photoCount } = data;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Pedido Aprobado — BOFT COLOMBIA</title>
</head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:'Helvetica Neue',Arial,sans-serif;color:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:#1a1a1a;border-radius:24px;overflow:hidden;border:1px solid #2a2a2a;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #2a2a2a;">
              <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.2em;color:#cff100;text-transform:uppercase;">BOFT COLOMBIA</p>
              <h1 style="margin:8px 0 0;font-size:26px;font-weight:900;color:#ffffff;line-height:1.2;">¡Tu pedido fue aprobado! 🎉</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 24px;font-size:15px;color:#b0b0b0;line-height:1.6;">
                Hola <strong style="color:#f5f5f5;">${customerName}</strong>, hemos confirmado tu pago y tu pedido ya está en camino. Guarda tu código de impresión:
              </p>

              <!-- Code highlight -->
              <div style="background:#0f0f0f;border:2px dashed #cff100;border-radius:16px;padding:24px;text-align:center;margin:0 0 28px;">
                <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.2em;color:#cff100;text-transform:uppercase;">Código de Impresión</p>
                <p style="margin:0;font-size:36px;font-weight:900;letter-spacing:0.1em;color:#cff100;font-family:'Courier New',monospace;">${printCode}</p>
              </div>

              <!-- Order summary -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #2a2a2a;border-radius:12px;overflow:hidden;margin:0 0 28px;">
                <tr style="background:#242424;">
                  <td style="padding:12px 16px;font-size:12px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.1em;">Detalle</td>
                  <td style="padding:12px 16px;font-size:12px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.1em;text-align:right;">Valor</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;font-size:14px;color:#d0d0d0;border-top:1px solid #2a2a2a;">Ref. pedido</td>
                  <td style="padding:12px 16px;font-size:14px;color:#d0d0d0;text-align:right;font-family:'Courier New',monospace;">#${orderId.slice(0, 8)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;font-size:14px;color:#d0d0d0;border-top:1px solid #2a2a2a;">Fotos</td>
                  <td style="padding:12px 16px;font-size:14px;color:#d0d0d0;text-align:right;">${photoCount} impresiones</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;font-size:15px;font-weight:700;color:#ffffff;border-top:1px solid #2a2a2a;">Total pagado</td>
                  <td style="padding:12px 16px;font-size:15px;font-weight:700;color:#cff100;text-align:right;">$${Number(totalPrice).toLocaleString('es-CO')}</td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#888;line-height:1.6;">
                Presenta este código cuando vayas a recoger tus fotos. Si tienes alguna pregunta, responde a este correo o escríbenos por Instagram.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #2a2a2a;text-align:center;">
              <p style="margin:0;font-size:11px;color:#555;letter-spacing:0.05em;">© 2026 BOFT COLOMBIA · PRINT YOUR HIGHLIGHTS</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  await transporter.sendMail({
    from: config.email.from,
    to: customerEmail,
    subject: `✅ Pedido aprobado — tu código es ${printCode}`,
    html,
  });
}
