import nodemailer from "nodemailer";
import { db } from "@db";
import { smtpSettings } from "@db/schema";

let mailer: nodemailer.Transporter | null = null;

export async function setupMailer() {
  try {
    const [settings] = await db
      .select()
      .from(smtpSettings)
      .limit(1);

    if (!settings) {
      mailer = null;
      return;
    }

    mailer = nodemailer.createTransport({
      host: settings.host,
      port: settings.port,
      secure: settings.port === 465,
      auth: {
        user: settings.username,
        pass: settings.password,
      },
    });
  } catch (error) {
    console.error('Error setting up mailer:', error);
    mailer = null;
  }
}

export async function sendEmail(subject: string, content: { text: string, html?: string }, toEmail?: string) {
  if (!mailer) {
    await setupMailer();
    if (!mailer) {
      console.error('Failed to setup mailer');
      return;
    }
  }

  try {
    const [settings] = await db
      .select()
      .from(smtpSettings)
      .limit(1);

    if (!settings) {
      console.error('No SMTP settings found');
      return;
    }

    const recipient = toEmail || settings.fromEmail;

    const mailOptions = {
      from: {
        name: '의료관리시스템',
        address: settings.fromEmail
      },
      to: recipient,
      subject,
      text: content.text,
      html: content.html,
      headers: {
        'Content-Type': 'text/html; charset=UTF-8'
      }
    };

    await mailer.sendMail(mailOptions);
    console.log('Email sent successfully with HTML content');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export const emailTemplates = {
  medicalRecord: (username: string, action: string, data: any, timestamp: string) => {
    const dataRows = Object.entries(data)
      .map(([key, value]) => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px; font-weight: bold;">${key}</td>
          <td style="padding: 12px;">${value}</td>
        </tr>
      `)
      .join('');

    return {
      subject: '의료 기록 업데이트 알림',
      content: {
        text: `사용자의 의료 기록이 ${action}되었습니다.\n\n` +
          `사용자: ${username}\n` +
          `시간: ${timestamp}\n` +
          `변경 내용: ${JSON.stringify(data, null, 2)}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
          </head>
          <body style="margin: 0; padding: 20px; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <div style="background: linear-gradient(to right, #4f46e5, #6366f1); color: white; padding: 24px; text-align: center;">
                <h2 style="margin: 0; font-size: 24px; font-weight: bold;">의료 기록 ${action} 알림</h2>
              </div>

              <div style="padding: 24px;">
                <div style="background: #f8fafc; border-left: 4px solid #4f46e5; padding: 16px; margin-bottom: 20px; border-radius: 4px;">
                  <p style="margin: 0; font-size: 16px; font-weight: 500; color: #1f2937;">
                    ${username} 님의 의료 기록이 업데이트되었습니다
                  </p>
                </div>

                <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: white;">
                  <thead>
                    <tr style="background: #f8fafc; border-bottom: 2px solid #e5e7eb;">
                      <th style="padding: 12px; text-align: left; font-weight: 600; color: #4b5563;">항목</th>
                      <th style="padding: 12px; text-align: left; font-weight: 600; color: #4b5563;">내용</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${dataRows}
                  </tbody>
                </table>

                <div style="color: #6b7280; font-size: 14px; text-align: right; margin-top: 20px; font-style: italic;">
                  업데이트 시간: ${timestamp}
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      }
    };
  },

  emergencyContact: (username: string, contactData: any, timestamp: string) => ({
    subject: '비상 연락처 추가 알림',
    content: {
      text: `사용자가 새로운 비상 연락처를 추가했습니다.\n\n` +
        `사용자: ${username}\n` +
        `연락처 정보:\n` +
        `이름: ${contactData.name}\n` +
        `관계: ${contactData.relationship}\n` +
        `전화번호: ${contactData.phoneNumber}\n` +
        `시간: ${timestamp}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="margin: 0; padding: 20px; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(to right, #4f46e5, #6366f1); color: white; padding: 24px; text-align: center;">
              <h2 style="margin: 0; font-size: 24px; font-weight: bold;">비상 연락처 추가 알림</h2>
            </div>

            <div style="padding: 24px;">
              <div style="background: #f8fafc; border-left: 4px solid #4f46e5; padding: 16px; margin-bottom: 20px; border-radius: 4px;">
                <p style="margin: 0; font-size: 16px; font-weight: 500; color: #1f2937;">
                  ${username} 님이 새로운 비상 연락처를 추가했습니다
                </p>
              </div>

              <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: white;">
                <thead>
                  <tr style="background: #f8fafc; border-bottom: 2px solid #e5e7eb;">
                    <th style="padding: 12px; text-align: left; font-weight: 600; color: #4b5563;">구분</th>
                    <th style="padding: 12px; text-align: left; font-weight: 600; color: #4b5563;">정보</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px; font-weight: bold;">이름</td>
                    <td style="padding: 12px;">${contactData.name}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px; font-weight: bold;">관계</td>
                    <td style="padding: 12px;">${contactData.relationship}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px; font-weight: bold;">전화번호</td>
                    <td style="padding: 12px;">${contactData.phoneNumber}</td>
                  </tr>
                  ${contactData.email ? `
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px; font-weight: bold;">이메일</td>
                    <td style="padding: 12px;">${contactData.email}</td>
                  </tr>
                  ` : ''}
                  ${contactData.isMainContact ? `
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px; font-weight: bold;">구분</td>
                    <td style="padding: 12px;">
                      <span style="display: inline-block; padding: 4px 12px; background: #dcfce7; color: #166534; border-radius: 9999px; font-size: 12px; font-weight: 600;">
                        주 연락처
                      </span>
                    </td>
                  </tr>
                  ` : ''}
                </tbody>
              </table>

              <div style="color: #6b7280; font-size: 14px; text-align: right; margin-top: 20px; font-style: italic;">
                등록 시간: ${timestamp}
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    }
  }),

  appointmentCreated: (username: string, appointment: any) => ({
    subject: '진료 예약 확인',
    content: {
      text: `${username}님의 진료 예약이 완료되었습니다.\n\n` +
        `진료과: ${appointment.department}\n` +
        `예약 일시: ${new Date(appointment.date).toLocaleString()}\n`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="margin: 0; padding: 20px; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(to right, #4f46e5, #6366f1); color: white; padding: 24px; text-align: center;">
              <h2 style="margin: 0; font-size: 24px; font-weight: bold;">진료 예약 확인</h2>
            </div>

            <div style="padding: 24px;">
              <div style="background: #f8fafc; border-left: 4px solid #4f46e5; padding: 16px; margin-bottom: 20px; border-radius: 4px;">
                <p style="margin: 0; font-size: 16px; font-weight: 500; color: #1f2937;">
                  ${username} 님의 진료 예약이 완료되었습니다
                </p>
              </div>

              <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: white;">
                <thead>
                  <tr style="background: #f8fafc; border-bottom: 2px solid #e5e7eb;">
                    <th style="padding: 12px; text-align: left; font-weight: 600; color: #4b5563;">구분</th>
                    <th style="padding: 12px; text-align: left; font-weight: 600; color: #4b5563;">정보</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px; font-weight: bold;">진료과</td>
                    <td style="padding: 12px;">${appointment.department}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px; font-weight: bold;">예약 일시</td>
                    <td style="padding: 12px;">${new Date(appointment.date).toLocaleString()}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px; font-weight: bold;">상태</td>
                    <td style="padding: 12px;">
                      <span style="display: inline-block; padding: 4px 12px; background: #fef9c3; color: #854d0e; border-radius: 9999px; font-size: 12px; font-weight: 600;">
                        예약 완료
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div style="color: #6b7280; font-size: 14px; text-align: right; margin-top: 20px; font-style: italic;">
                예약 시간: ${new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    }
  }),

  appointmentRescheduled: (username: string, appointment: any, oldDate: string) => ({
    subject: '진료 예약 변경 확인',
    content: {
      text: `${username}님의 진료 예약이 변경되었습니다.\n\n` +
        `진료과: ${appointment.department}\n` +
        `기존 예약 일시: ${new Date(oldDate).toLocaleString()}\n` +
        `변경된 예약 일시: ${new Date(appointment.date).toLocaleString()}\n`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="margin: 0; padding: 20px; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(to right, #4f46e5, #6366f1); color: white; padding: 24px; text-align: center;">
              <h2 style="margin: 0; font-size: 24px; font-weight: bold;">진료 예약 변경 확인</h2>
            </div>

            <div style="padding: 24px;">
              <div style="background: #f8fafc; border-left: 4px solid #4f46e5; padding: 16px; margin-bottom: 20px; border-radius: 4px;">
                <p style="margin: 0; font-size: 16px; font-weight: 500; color: #1f2937;">
                  ${username} 님의 진료 예약이 변경되었습니다
                </p>
              </div>

              <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: white;">
                <thead>
                  <tr style="background: #f8fafc; border-bottom: 2px solid #e5e7eb;">
                    <th style="padding: 12px; text-align: left; font-weight: 600; color: #4b5563;">구분</th>
                    <th style="padding: 12px; text-align: left; font-weight: 600; color: #4b5563;">정보</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px; font-weight: bold;">진료과</td>
                    <td style="padding: 12px;">${appointment.department}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px; font-weight: bold;">기존 예약 일시</td>
                    <td style="padding: 12px;">
                      <span style="color: #94a3b8; text-decoration: line-through;">
                        ${new Date(oldDate).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px; font-weight: bold;">변경된 예약 일시</td>
                    <td style="padding: 12px;">${new Date(appointment.date).toLocaleString()}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px; font-weight: bold;">상태</td>
                    <td style="padding: 12px;">
                      <span style="display: inline-block; padding: 4px 12px; background: #fef9c3; color: #854d0e; border-radius: 9999px; font-size: 12px; font-weight: 600;">
                        예약 변경
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div style="color: #6b7280; font-size: 14px; text-align: right; margin-top: 20px; font-style: italic;">
                변경 시간: ${new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    }
  }),

  appointmentCancelled: (username: string, appointment: any) => ({
    subject: '진료 예약 취소 확인',
    content: {
      text: `${username}님의 진료 예약이 취소되었습니다.\n\n` +
        `진료과: ${appointment.department}\n` +
        `취소된 예약 일시: ${new Date(appointment.date).toLocaleString()}\n`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="margin: 0; padding: 20px; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(to right, #4f46e5, #6366f1); color: white; padding: 24px; text-align: center;">
              <h2 style="margin: 0; font-size: 24px; font-weight: bold;">진료 예약 취소 확인</h2>
            </div>

            <div style="padding: 24px;">
              <div style="background: #f8fafc; border-left: 4px solid #4f46e5; padding: 16px; margin-bottom: 20px; border-radius: 4px;">
                <p style="margin: 0; font-size: 16px; font-weight: 500; color: #1f2937;">
                  ${username} 님의 진료 예약이 취소되었습니다
                </p>
              </div>

              <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: white;">
                <thead>
                  <tr style="background: #f8fafc; border-bottom: 2px solid #e5e7eb;">
                    <th style="padding: 12px; text-align: left; font-weight: 600; color: #4b5563;">구분</th>
                    <th style="padding: 12px; text-align: left; font-weight: 600; color: #4b5563;">정보</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px; font-weight: bold;">진료과</td>
                    <td style="padding: 12px;">${appointment.department}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px; font-weight: bold;">취소된 예약 일시</td>
                    <td style="padding: 12px;">
                      <span style="color: #94a3b8; text-decoration: line-through;">
                        ${new Date(appointment.date).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 12px; font-weight: bold;">상태</td>
                    <td style="padding: 12px;">
                      <span style="display: inline-block; padding: 4px 12px; background: #fee2e2; color: #991b1b; border-radius: 9999px; font-size: 12px; font-weight: 600;">
                        예약 취소
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div style="color: #6b7280; font-size: 14px; text-align: right; margin-top: 20px; font-style: italic;">
                취소 시간: ${new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    }
  }),
};