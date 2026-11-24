import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || process.env.SMTP_FROM,
    pass: process.env.SMTP_PASS,
  },
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

interface InvoiceEmailData {
  invoiceNumber: string
  recipientName: string
  recipientEmail: string
  items: Array<{ description: string; quantity: number; unit_price: number; total: number }>
  subtotal: number
  vatAmount: number
  totalAmount: number
  dueDate: string
  issueDate: string
}

export async function sendInvoiceEmail(data: InvoiceEmailData): Promise<boolean> {
  if (!process.env.SMTP_USER && !process.env.SMTP_FROM) {
    console.warn('[email] SMTP not configured — skipping invoice email')
    return false
  }
  try {
    const html = '<p>Invoice ' + data.invoiceNumber + '</p>'
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: data.recipientEmail,
      subject: 'Invoice ' + data.invoiceNumber + ' from Magic Training Ltd',
      html,
    })
    return true
  } catch (err) {
    console.error('[email] Failed to send invoice:', err)
    return false
  }
}
