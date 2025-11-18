// lib/email.js

// Fallback email system - logs to console and can be upgraded to Resend later
export async function sendBookingConfirmation(booking, barber, service) {
    try {
        const emailData = {
            to: booking.client_email,
            subject: `Booking Confirmation - ${barber.shop_name || barber.name}`,
            html: generateEmailTemplate(booking, barber, service)
        }

        // In development, log the email to console
        if (process.env.NODE_ENV === 'development') {
            console.log('📧 Email would be sent:', {
                to: emailData.to,
                subject: emailData.subject,
                bookingId: booking.id
            })

            // Simulate successful email sending
            return { success: true, data: { id: 'console_log' } }
        }

        // Try to use Resend if available and API key exists
        if (process.env.RESEND_API_KEY) {
            const { Resend } = await import('resend')
            const resend = new Resend(process.env.RESEND_API_KEY)

            const { data, error } = await resend.emails.send({
                from: 'BarberBook <bookings@barberbook.com>',
                ...emailData
            })

            if (error) {
                console.error('Resend error:', error)
                // Fall back to console log
                console.log('📧 Email fallback:', emailData)
                return { success: true, data: { id: 'fallback_console' } }
            }

            return { success: true, data }
        } else {
            // No Resend API key, log to console
            console.log('📧 Email (no API key):', emailData)
            return { success: true, data: { id: 'no_api_key' } }
        }

    } catch (error) {
        console.error('Error in email system:', error)
        // Don't fail the booking if email fails
        return { success: true, data: { id: 'error_fallback' } }
    }
}

function generateEmailTemplate(booking, barber, service) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none; }
        .details { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; }
        .button { background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Confirmed! 🎉</h1>
          <p>Your appointment with ${barber.shop_name || barber.name} is confirmed</p>
        </div>
        <div class="content">
          <p>Hi <strong>${booking.client_name}</strong>,</p>
          <p>Your appointment has been successfully booked. Here are your appointment details:</p>
          
          <div class="details">
            <h3 style="margin-top: 0; color: #1f2937;">Appointment Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;"><strong>Service:</strong></td>
                <td style="padding: 8px 0;">${service.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;"><strong>Date:</strong></td>
                <td style="padding: 8px 0;">${new Date(booking.appointment_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;"><strong>Time:</strong></td>
                <td style="padding: 8px 0;">${booking.appointment_time}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;"><strong>Duration:</strong></td>
                <td style="padding: 8px 0;">${service.duration_minutes} minutes</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;"><strong>Price:</strong></td>
                <td style="padding: 8px 0;">$${service.price}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;"><strong>Barber:</strong></td>
                <td style="padding: 8px 0;">${barber.name}</td>
              </tr>
              ${barber.phone ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280;"><strong>Contact:</strong></td>
                <td style="padding: 8px 0;">${barber.phone}</td>
              </tr>
              ` : ''}
              ${barber.address ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280;"><strong>Location:</strong></td>
                <td style="padding: 8px 0;">${barber.address}, ${barber.city}, ${barber.state} ${barber.zip_code}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <div style="background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>💡 Important:</strong> We'll send you a reminder before your appointment. 
              If you need to reschedule or cancel, please contact the barber directly.
            </p>
          </div>

          <p style="margin-top: 25px;">Looking forward to seeing you!</p>
          <p><strong>The BarberBook Team</strong></p>
        </div>
        
        <div class="footer">
          <p>© 2024 BarberBook. All rights reserved.</p>
          <p>If you have any questions, contact us at support@barberbook.com</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Export other email functions you might need later
export async function sendAppointmentReminder(booking, barber, service) {
    console.log('📧 Appointment reminder would be sent for:', booking.id)
    return { success: true }
}

export async function sendCancellationNotice(booking, barber, service) {
    console.log('📧 Cancellation notice would be sent for:', booking.id)
    return { success: true }
}