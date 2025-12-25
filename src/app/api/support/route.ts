import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const SUPPORT_EMAIL = 'support@quotecord.com'

// Category labels for the email subject
const CATEGORY_LABELS: Record<string, string> = {
  billing: 'Billing',
  bug: 'Bug Report',
  feature: 'Feature Request',
  account: 'Account Issue',
  other: 'General Inquiry',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { category, email, discordUsername, subject, message } = body

    // Validate required fields
    if (!category || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate category
    if (!CATEGORY_LABELS[category]) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }

    const categoryLabel = CATEGORY_LABELS[category]
    const emailSubject = `[${categoryLabel}] ${subject}`

    // Build the email HTML
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 24px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">New Support Request</h1>
        </div>
        <div style="background: #1a1a2e; padding: 24px; border-radius: 0 0 12px 12px; color: #e0e0e0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #333; color: #888; width: 120px;">Category</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #333;">
                <span style="background: #6366f1; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px;">
                  ${categoryLabel}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #333; color: #888;">From</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #333;">${email}</td>
            </tr>
            ${discordUsername ? `
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #333; color: #888;">Discord</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #333;">${discordUsername}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #333; color: #888;">Subject</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #333; font-weight: 600;">${subject}</td>
            </tr>
          </table>

          <div style="margin-top: 24px;">
            <p style="color: #888; margin: 0 0 8px 0; font-size: 14px;">Message</p>
            <div style="background: #0d0d1a; padding: 16px; border-radius: 8px; white-space: pre-wrap; line-height: 1.6;">
              ${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
            </div>
          </div>

          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #333; color: #666; font-size: 12px;">
            <p style="margin: 0;">Reply directly to this email to respond to the user.</p>
          </div>
        </div>
      </div>
    `

    // Send the email
    const { error } = await resend.emails.send({
      from: 'quotecord Support <noreply@quotecord.com>',
      to: SUPPORT_EMAIL,
      replyTo: email,
      subject: emailSubject,
      html: emailHtml,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Support API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
