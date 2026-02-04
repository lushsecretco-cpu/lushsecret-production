import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendPaymentConfirmationEmail = async (adminEmail, orderData) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: adminEmail,
      subject: `✅ Nuevo Pago Confirmado - Orden #${orderData.orderId}`,
      html: `
        <h2>Pago Confirmado</h2>
        <p><strong>ID de Orden:</strong> ${orderData.orderId}</p>
        <p><strong>Cliente:</strong> ${orderData.customerEmail}</p>
        <p><strong>Monto:</strong> $${orderData.totalAmount.toLocaleString('es-CO')}</p>
        <p><strong>Método de Pago:</strong> ${orderData.paymentMethod}</p>
        <p><strong>Fecha:</strong> ${new Date(orderData.createdAt).toLocaleString('es-CO')}</p>
        <h3>Detalles de Productos:</h3>
        <ul>
          ${orderData.items.map(item => `<li>${item.productName} x${item.quantity} - $${item.price}</li>`).join('')}
        </ul>
        <p>Por favor, prepara el pedido para envío.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Correo de confirmación de pago enviado a admin');
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
  }
};

export const sendPurchaseConfirmationEmail = async (customerEmail, orderData) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: customerEmail,
      subject: `🎉 Compra Confirmada - Orden #${orderData.orderId}`,
      html: `
        <h2>¡Gracias por tu compra!</h2>
        <p>Tu pago ha sido confirmado exitosamente.</p>
        <p><strong>ID de Orden:</strong> ${orderData.orderId}</p>
        <p><strong>Monto Total:</strong> $${orderData.totalAmount.toLocaleString('es-CO')}</p>
        <p><strong>Fecha:</strong> ${new Date(orderData.createdAt).toLocaleString('es-CO')}</p>
        
        <h3>Resumen de tu Compra:</h3>
        <ul>
          ${orderData.items.map(item => `<li>${item.productName} x${item.quantity} - $${item.price}</li>`).join('')}
        </ul>

        <h3>Estado del Pedido:</h3>
        <p>📦 <strong>Preparando pedido</strong> - Estamos alistando tus productos.</p>
        <p>Recibirás un correo cuando tu pedido sea enviado con el número de rastreo.</p>
        
        <p>¡Gracias por comprar en LushSecret!</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Correo de confirmación de compra enviado a cliente');
  } catch (error) {
    console.error('Error sending purchase confirmation email:', error);
  }
};

export const sendShippingNotificationEmail = async (customerEmail, orderData, trackingNumber) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: customerEmail,
      subject: `📦 Tu Pedido ha sido Enviado - Orden #${orderData.orderId}`,
      html: `
        <h2>¡Tu pedido ha sido enviado!</h2>
        <p>Tu compra está en camino.</p>
        
        <h3>Detalles del Envío:</h3>
        <p><strong>ID de Orden:</strong> ${orderData.orderId}</p>
        <p><strong>Número de Guía:</strong> <strong style="color: #007bff; font-size: 18px;">${trackingNumber}</strong></p>
        <p><strong>Fecha de Envío:</strong> ${new Date().toLocaleString('es-CO')}</p>
        
        <h3>Productos Enviados:</h3>
        <ul>
          ${orderData.items.map(item => `<li>${item.productName} x${item.quantity}</li>`).join('')}
        </ul>

        <p>Puedes rastrear tu envío usando el número de guía en tu cuenta de usuario o haciendo clic en el siguiente enlace:</p>
        <a href="${process.env.FRONTEND_URL}/tracking/${trackingNumber}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Rastrear mi Envío
        </a>

        <p style="margin-top: 20px; color: #666; font-size: 12px;">
          Si tienes preguntas, contacta a nuestro equipo de soporte.
        </p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Correo de envío enviado a cliente');
  } catch (error) {
    console.error('Error sending shipping notification email:', error);
  }
};

export const sendDeliveryConfirmationEmail = async (customerEmail, orderData, trackingNumber) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: customerEmail,
      subject: `✅ Tu Pedido ha sido Entregado - Orden #${orderData.orderId}`,
      html: `
        <h2>¡Tu pedido ha llegado!</h2>
        <p>Tu compra ha sido entregada exitosamente.</p>
        
        <h3>Detalles de Entrega:</h3>
        <p><strong>ID de Orden:</strong> ${orderData.orderId}</p>
        <p><strong>Número de Guía:</strong> ${trackingNumber}</p>
        <p><strong>Fecha de Entrega:</strong> ${new Date().toLocaleString('es-CO')}</p>
        
        <p>Esperamos que disfrutes tus productos. Si tienes algún inconveniente, no dudes en contactarnos.</p>
        <p>¡Gracias por confiar en LushSecret!</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Correo de entrega enviado a cliente');
  } catch (error) {
    console.error('Error sending delivery confirmation email:', error);
  }
};

export const sendVerificationCodeEmail = async (customerEmail, code) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: customerEmail,
      subject: '🔐 Código de verificación - LushSecret',
      html: `
        <h2>Verifica tu correo</h2>
        <p>Usa este código para completar tu registro:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${code}</p>
        <p>Este código expira en 15 minutos.</p>
        <p>Si no solicitaste este registro, puedes ignorar este mensaje.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Correo de verificación enviado');
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};
