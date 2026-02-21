const nodemailer = require('nodemailer');
const config = require('../config/config');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: config.email.host,
            port: config.email.port,
            secure: config.email.secure,
            auth: {
                user: config.email.user,
                pass: config.email.pass
            }
        });

        // Test connection
        this.transporter.verify((error, success) => {
            if (error) {
                console.warn('⚠️ Email Service: SMTP Connection Error. Check your configuration.');
            } else {
                console.log('📬 Email Service: SMTP Connection established');
            }
        });
    }

    async sendEmail({ to, subject, html }) {
        try {
            const info = await this.transporter.sendMail({
                from: config.email.from,
                to,
                subject,
                html
            });
            console.log('✅ Email sent: %s', info.messageId);
            return info;
        } catch (error) {
            console.error('❌ Email failed:', error);
            throw error;
        }
    }

    async sendStaffInvitation(user, invitationLink) {
        const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
        <h2 style="color: #137fec;">Welcome to CareSync!</h2>
        <p>Hello ${user.firstName},</p>
        <p>You have been invited to join the CareSync Hospital Management System as a <strong>${user.role}</strong>.</p>
        <p>Please click the button below to set up your account and get started:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${invitationLink}" style="background-color: #137fec; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Set Up Account</a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="color: #64748b; font-size: 12px;">${invitationLink}</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="font-size: 12px; color: #94a3b8;">This is an automated message. Please do not reply.</p>
      </div>
    `;

        return this.sendEmail({
            to: user.email,
            subject: 'CareSync - Staff Invitation',
            html
        });
    }

    async sendInvoiceEmail(patientEmail, invoice) {
        const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
        <h2 style="color: #137fec;">New Invoice from CareSync</h2>
        <p>Hello,</p>
        <p>A new invoice <strong>#${invoice.invoiceNumber}</strong> has been generated for your recent visit.</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #1e293b;">Total Amount: $${invoice.totalAmount}</p>
          <p style="margin: 5px 0 0 0; color: #64748b;">Status: ${invoice.paymentStatus.toUpperCase()}</p>
        </div>
        <p>Thank you for choosing CareSync.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="font-size: 12px; color: #94a3b8;">CareSync Hospital Management System</p>
      </div>
    `;

        return this.sendEmail({
            to: patientEmail,
            subject: `CareSync - Invoice #${invoice.invoiceNumber}`,
            html
        });
    }
}

module.exports = new EmailService();
