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
        'Content-Type': 'text/html; charset=utf-8'
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
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${key}</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${value}</td>
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
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Malgun Gothic', '맑은 고딕', sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: #4F46E5; color: white; padding: 20px; border-radius: 8px; text-align: center;">
                <h2 style="margin: 0;">의료 기록 ${action} 알림</h2>
              </div>
              <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="background: #F3F4F6; padding: 15px; border-left: 4px solid #4F46E5; margin-bottom: 20px; border-radius: 4px;">
                  ${username} 님의 의료 기록이 업데이트되었습니다
                </div>
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background: #F9FAFB;">
                      <th style="padding: 8px; text-align: left; border-bottom: 2px solid #eee;">항목</th>
                      <th style="padding: 8px; text-align: left; border-bottom: 2px solid #eee;">내용</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${dataRows}
                  </tbody>
                </table>
                <div style="color: #6B7280; font-size: 14px; text-align: right; margin-top: 20px;">
                  업데이트 시간: ${timestamp}
                </div>
              </div>
            </div>
          </div>
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
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Malgun Gothic', '맑은 고딕', sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #4F46E5; color: white; padding: 20px; border-radius: 8px; text-align: center;">
              <h2 style="margin: 0;">비상 연락처 추가 알림</h2>
            </div>
            <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="background: #F3F4F6; padding: 15px; border-left: 4px solid #4F46E5; margin-bottom: 20px; border-radius: 4px;">
                ${username} 님이 새로운 비상 연락처를 추가했습니다
              </div>
              <table style="width: 100%; border-collapse: collapse;">
                <tbody>
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>이름</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">${contactData.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>관계</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">${contactData.relationship}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>전화번호</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">${contactData.phoneNumber}</td>
                  </tr>
                  ${contactData.email ? `
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>이메일</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">${contactData.email}</td>
                  </tr>
                  ` : ''}
                  ${contactData.isMainContact ? `
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>구분</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">
                      <span style="background: #DEF7EC; color: #03543F; padding: 4px 8px; border-radius: 9999px; font-size: 12px;">
                        주 연락처
                      </span>
                    </td>
                  </tr>
                  ` : ''}
                </tbody>
              </table>
              <div style="color: #6B7280; font-size: 14px; text-align: right; margin-top: 20px;">
                등록 시간: ${timestamp}
              </div>
            </div>
          </div>
        </div>
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
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Malgun Gothic', '맑은 고딕', sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #4F46E5; color: white; padding: 20px; border-radius: 8px; text-align: center;">
              <h2 style="margin: 0;">진료 예약 확인</h2>
            </div>
            <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="background: #F3F4F6; padding: 15px; border-left: 4px solid #4F46E5; margin-bottom: 20px; border-radius: 4px;">
                ${username} 님의 진료 예약이 완료되었습니다
              </div>
              <table style="width: 100%; border-collapse: collapse;">
                <tbody>
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>진료과</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">${appointment.department}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>예약 일시</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">${new Date(appointment.date).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>상태</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">
                      <span style="background: #FEF3C7; color: #92400E; padding: 4px 8px; border-radius: 9999px; font-size: 12px;">
                        예약 완료
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div style="color: #6B7280; font-size: 14px; text-align: right; margin-top: 20px;">
                예약 시간: ${new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </div>
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
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Malgun Gothic', '맑은 고딕', sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #4F46E5; color: white; padding: 20px; border-radius: 8px; text-align: center;">
              <h2 style="margin: 0;">진료 예약 변경 확인</h2>
            </div>
            <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="background: #F3F4F6; padding: 15px; border-left: 4px solid #4F46E5; margin-bottom: 20px; border-radius: 4px;">
                ${username} 님의 진료 예약이 변경되었습니다
              </div>
              <table style="width: 100%; border-collapse: collapse;">
                <tbody>
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>진료과</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">${appointment.department}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>기존 예약 일시</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">
                      <span style="text-decoration: line-through; color: #9CA3AF;">
                        ${new Date(oldDate).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>변경된 예약 일시</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">${new Date(appointment.date).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>상태</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">
                      <span style="background: #FEF3C7; color: #92400E; padding: 4px 8px; border-radius: 9999px; font-size: 12px;">
                        예약 변경
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div style="color: #6B7280; font-size: 14px; text-align: right; margin-top: 20px;">
                변경 시간: ${new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </div>
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
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Malgun Gothic', '맑은 고딕', sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #4F46E5; color: white; padding: 20px; border-radius: 8px; text-align: center;">
              <h2 style="margin: 0;">진료 예약 취소 확인</h2>
            </div>
            <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <div style="background: #F3F4F6; padding: 15px; border-left: 4px solid #4F46E5; margin-bottom: 20px; border-radius: 4px;">
                ${username} 님의 진료 예약이 취소되었습니다
              </div>
              <table style="width: 100%; border-collapse: collapse;">
                <tbody>
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>진료과</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">${appointment.department}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>취소된 예약 일시</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">
                      <span style="text-decoration: line-through; color: #9CA3AF;">
                        ${new Date(appointment.date).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>상태</strong></td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">
                      <span style="background: #FEE2E2; color: #991B1B; padding: 4px 8px; border-radius: 9999px; font-size: 12px;">
                        예약 취소
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div style="color: #6B7280; font-size: 14px; text-align: right; margin-top: 20px;">
                취소 시간: ${new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      `
    }
  }),
};