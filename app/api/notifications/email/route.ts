import { NextRequest, NextResponse } from 'next/server';

export interface EmailPayload {
  to: string;
  recipientName: string;
  type: 'upcoming_dose' | 'missed_dose_escalation' | 'doctor_appointment' | 'emergency_sos';
  subject: string;
  seniorName: string;
  details: {
    medicationName?: string;
    dosage?: string;
    scheduledTime?: string;
    doctorName?: string;
    clinicName?: string;
    appointmentDate?: string;
    appointmentTime?: string;
    prepInstructions?: string[];
    sosLocation?: string;
    notes?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const payload: EmailPayload = await req.json();

    const timestamp = new Date().toISOString();
    const formattedDate = new Date().toLocaleString('en-US', {
      timeZone: 'UTC',
      dateStyle: 'full',
      timeStyle: 'short',
    });

    // Build rich, accessible HTML email template
    let emailHtml = '';
    let emailTitle = '';
    let badgeColor = '#2563eb';

    if (payload.type === 'upcoming_dose') {
      emailTitle = `Medication Reminder: ${payload.details.medicationName}`;
      badgeColor = '#3b82f6';
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 24px; color: white; text-align: center;">
            <h1 style="margin: 0; font-size: 22px;">SentinelCare AI • Care Circle Alert</h1>
            <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;">Medication Window Reminder</p>
          </div>
          <div style="padding: 24px; color: #334155;">
            <p style="font-size: 16px;">Hello <strong>${payload.recipientName}</strong>,</p>
            <p style="font-size: 15px; line-height: 1.6;">
              This is a scheduled reminder for <strong>${payload.seniorName}</strong>'s upcoming healthcare routine:
            </p>
            <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 6px; margin: 20px 0;">
              <h2 style="margin: 0 0 8px 0; font-size: 18px; color: #1e293b;">${payload.details.medicationName} (${payload.details.dosage})</h2>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Scheduled Time:</strong> ${payload.details.scheduledTime}</p>
              ${payload.details.notes ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Special Instructions:</strong> ${payload.details.notes}</p>` : ''}
            </div>
            <p style="font-size: 14px; color: #64748b;">
              If ${payload.seniorName} has already taken this dose, it can be marked as confirmed in the SentinelCare portal.
            </p>
          </div>
          <div style="background: #f1f5f9; padding: 14px 24px; text-align: center; font-size: 12px; color: #64748b;">
            SentinelCare Autonomous Healthcare Guardian • Sent at ${formattedDate}
          </div>
        </div>
      `;
    } else if (payload.type === 'missed_dose_escalation') {
      emailTitle = `URGENT: Missed Medication Escalation for ${payload.seniorName}`;
      badgeColor = '#ef4444';
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #ef4444; border-radius: 12px; overflow: hidden; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #b91c1c, #ef4444); padding: 24px; color: white; text-align: center;">
            <h1 style="margin: 0; font-size: 22px;">⚠️ SentinelCare • ESCALATION ALERT</h1>
            <p style="margin: 6px 0 0 0; opacity: 0.95; font-size: 14px;">Medication Window Overdue (> 30 Mins)</p>
          </div>
          <div style="padding: 24px; color: #334155;">
            <p style="font-size: 16px;">Attention <strong>${payload.recipientName}</strong>,</p>
            <p style="font-size: 15px; line-height: 1.6; color: #991b1b; font-weight: 600;">
              Our autonomous adherence monitor detected an unconfirmed scheduled dose for ${payload.seniorName}:
            </p>
            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 6px; margin: 20px 0;">
              <h2 style="margin: 0 0 8px 0; font-size: 18px; color: #991b1b;">${payload.details.medicationName} (${payload.details.dosage})</h2>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Target Dose Time:</strong> ${payload.details.scheduledTime}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Grace Period Status:</strong> Exceeded. No confirmation received from patient.</p>
            </div>
            <div style="background: #fffbeb; border: 1px solid #fef3c7; padding: 12px 16px; border-radius: 6px; font-size: 14px; color: #92400e;">
              <strong>Recommended Action:</strong> Please contact ${payload.seniorName} or the attending caretaker to verify their wellbeing and assist with taking this medication safely.
            </div>
          </div>
          <div style="background: #f1f5f9; padding: 14px 24px; text-align: center; font-size: 12px; color: #64748b;">
            SentinelCare AI Safety Escalation Loop • Auto-dispatched at ${formattedDate}
          </div>
        </div>
      `;
    } else if (payload.type === 'doctor_appointment') {
      emailTitle = `Upcoming Medical Appointment Reminder: Dr. ${payload.details.doctorName}`;
      badgeColor = '#059669';
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #047857, #10b981); padding: 24px; color: white; text-align: center;">
            <h1 style="margin: 0; font-size: 22px;">🗓️ SentinelCare • Appointment Reminder</h1>
            <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;">Healthcare Routine Coordination</p>
          </div>
          <div style="padding: 24px; color: #334155;">
            <p style="font-size: 16px;">Hello <strong>${payload.recipientName}</strong>,</p>
            <p style="font-size: 15px; line-height: 1.6;">
              ${payload.seniorName} has an upcoming doctor visit scheduled:
            </p>
            <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; border-radius: 6px; margin: 20px 0;">
              <h2 style="margin: 0 0 6px 0; font-size: 18px; color: #065f46;">${payload.details.doctorName}</h2>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Clinic / Location:</strong> ${payload.details.clinicName}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Date & Time:</strong> ${payload.details.appointmentDate} at ${payload.details.appointmentTime}</p>
            </div>
            ${
              payload.details.prepInstructions && payload.details.prepInstructions.length > 0
                ? `<div style="margin-top: 16px;">
                    <strong style="color: #0f172a; font-size: 14px;">Preparation Checklist:</strong>
                    <ul style="margin: 8px 0; padding-left: 20px; color: #475569; font-size: 14px;">
                      ${payload.details.prepInstructions.map((p) => `<li style="margin-bottom: 4px;">${p}</li>`).join('')}
                    </ul>
                  </div>`
                : ''
            }
          </div>
          <div style="background: #f1f5f9; padding: 14px 24px; text-align: center; font-size: 12px; color: #64748b;">
            SentinelCare Proactive Care Coordinator • Dispatched at ${formattedDate}
          </div>
        </div>
      `;
    } else {
      emailTitle = `EMERGENCY SOS SIGNAL: ${payload.seniorName}`;
      badgeColor = '#dc2626';
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 3px solid #dc2626; border-radius: 12px; overflow: hidden; background: #ffffff;">
          <div style="background: #dc2626; padding: 24px; color: white; text-align: center;">
            <h1 style="margin: 0; font-size: 26px;">🚨 CRITICAL SOS ALERT</h1>
            <p style="margin: 6px 0 0 0; font-size: 16px; font-weight: bold;">Immediate Assistance Requested</p>
          </div>
          <div style="padding: 24px; color: #1e293b;">
            <p style="font-size: 16px;">Emergency contacts for <strong>${payload.seniorName}</strong>,</p>
            <p style="font-size: 15px; color: #dc2626; font-weight: bold;">
              ${payload.seniorName} activated the One-Tap Emergency Assistance beacon on their SentinelCare device.
            </p>
            <div style="background: #fef2f2; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #fecaca;">
              <p style="margin: 4px 0;"><strong>Timestamp:</strong> ${formattedDate}</p>
              <p style="margin: 4px 0;"><strong>Status:</strong> Alert Broadcast Sent to All Family Guardians</p>
            </div>
            <p style="font-size: 14px;">Please call ${payload.seniorName} immediately or dispatch emergency medical services.</p>
          </div>
        </div>
      `;
    }

    // Try sending with Resend API if API key is provided
    let externalSendStatus = 'simulated';
    if (process.env.RESEND_API_KEY) {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || 'SentinelCare <alerts@sentinelcare.ai>',
            to: payload.to,
            subject: payload.subject || emailTitle,
            html: emailHtml,
          }),
        });
        if (resendRes.ok) {
          externalSendStatus = 'sent_via_resend';
        }
      } catch (err) {
        console.warn('External Resend dispatch failed:', err);
      }
    }

    return NextResponse.json({
      success: true,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      status: externalSendStatus,
      recipient: payload.to,
      subject: payload.subject || emailTitle,
      htmlPreview: emailHtml,
      timestamp,
    });
  } catch (error: unknown) {
    console.error('Email dispatch error:', error);
    const message = error instanceof Error ? error.message : 'Failed to send notification';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
