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
        <tr>
          <td><strong>${key}</strong></td>
          <td>${value}</td>
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
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');

              body {
                font-family: 'Noto Sans KR', sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f5f5f5;
              }

              .email-container {
                max-width: 600px;
                margin: 20px auto;
                background: #ffffff;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }

              .email-header {
                background: linear-gradient(135deg, #4f46e5, #6366f1);
                color: white;
                padding: 30px;
                text-align: center;
              }

              .email-header h2 {
                margin: 0;
                font-size: 24px;
                font-weight: 700;
              }

              .email-content {
                padding: 30px;
                background: #ffffff;
              }

              .highlight-box {
                background: linear-gradient(to right, #f3f4f6, #ffffff);
                border-left: 4px solid #4f46e5;
                padding: 20px;
                margin-bottom: 20px;
                border-radius: 8px;
              }

              .data-table {
                width: 100%;
                border-collapse: separate;
                border-spacing: 0;
                margin: 20px 0;
              }

              .data-table th {
                background: #f9fafb;
                padding: 12px 16px;
                text-align: left;
                font-weight: 600;
                color: #4b5563;
                border-bottom: 2px solid #e5e7eb;
              }

              .data-table td {
                padding: 12px 16px;
                border-bottom: 1px solid #e5e7eb;
              }

              .data-table tr:last-child td {
                border-bottom: none;
              }

              .timestamp {
                color: #6b7280;
                font-size: 14px;
                text-align: right;
                margin-top: 20px;
                font-style: italic;
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="email-header">
                <h2>의료 기록 ${action} 알림</h2>
              </div>
              <div class="email-content">
                <div class="highlight-box">
                  <p style="margin: 0; font-size: 16px; font-weight: 500;">
                    ${username} 님의 의료 기록이 업데이트되었습니다
                  </p>
                </div>
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>항목</th>
                      <th>내용</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${dataRows}
                  </tbody>
                </table>
                <div class="timestamp">
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
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');

            body {
              font-family: 'Noto Sans KR', sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }

            .email-container {
              max-width: 600px;
              margin: 20px auto;
              background: #ffffff;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }

            .email-header {
              background: linear-gradient(135deg, #4f46e5, #6366f1);
              color: white;
              padding: 30px;
              text-align: center;
            }

            .email-header h2 {
              margin: 0;
              font-size: 24px;
              font-weight: 700;
            }

            .email-content {
              padding: 30px;
              background: #ffffff;
            }

            .highlight-box {
              background: linear-gradient(to right, #f3f4f6, #ffffff);
              border-left: 4px solid #4f46e5;
              padding: 20px;
              margin-bottom: 20px;
              border-radius: 8px;
            }

            .data-table {
              width: 100%;
              border-collapse: separate;
              border-spacing: 0;
              margin: 20px 0;
            }

            .data-table th {
              background: #f9fafb;
              padding: 12px 16px;
              text-align: left;
              font-weight: 600;
              color: #4b5563;
              border-bottom: 2px solid #e5e7eb;
            }

            .data-table td {
              padding: 12px 16px;
              border-bottom: 1px solid #e5e7eb;
            }

            .data-table tr:last-child td {
              border-bottom: none;
            }

            .status-badge {
              display: inline-flex;
              align-items: center;
              padding: 6px 12px;
              border-radius: 9999px;
              font-size: 12px;
              font-weight: 600;
              background: #dcfce7;
              color: #166534;
            }

            .timestamp {
              color: #6b7280;
              font-size: 14px;
              text-align: right;
              margin-top: 20px;
              font-style: italic;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h2>비상 연락처 추가 알림</h2>
            </div>
            <div class="email-content">
              <div class="highlight-box">
                <p style="margin: 0; font-size: 16px; font-weight: 500;">
                  ${username} 님이 새로운 비상 연락처를 추가했습니다
                </p>
              </div>
              <table class="data-table">
                <thead>
                  <tr>
                    <th>구분</th>
                    <th>정보</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>이름</strong></td>
                    <td>${contactData.name}</td>
                  </tr>
                  <tr>
                    <td><strong>관계</strong></td>
                    <td>${contactData.relationship}</td>
                  </tr>
                  <tr>
                    <td><strong>전화번호</strong></td>
                    <td>${contactData.phoneNumber}</td>
                  </tr>
                  ${contactData.email ? `
                  <tr>
                    <td><strong>이메일</strong></td>
                    <td>${contactData.email}</td>
                  </tr>
                  ` : ''}
                  ${contactData.isMainContact ? `
                  <tr>
                    <td><strong>구분</strong></td>
                    <td>
                      <span class="status-badge">주 연락처</span>
                    </td>
                  </tr>
                  ` : ''}
                </tbody>
              </table>
              <div class="timestamp">
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
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');

            body {
              font-family: 'Noto Sans KR', sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }

            .email-container {
              max-width: 600px;
              margin: 20px auto;
              background: #ffffff;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }

            .email-header {
              background: linear-gradient(135deg, #4f46e5, #6366f1);
              color: white;
              padding: 30px;
              text-align: center;
            }

            .email-header h2 {
              margin: 0;
              font-size: 24px;
              font-weight: 700;
            }

            .email-content {
              padding: 30px;
              background: #ffffff;
            }

            .highlight-box {
              background: linear-gradient(to right, #f3f4f6, #ffffff);
              border-left: 4px solid #4f46e5;
              padding: 20px;
              margin-bottom: 20px;
              border-radius: 8px;
            }

            .data-table {
              width: 100%;
              border-collapse: separate;
              border-spacing: 0;
              margin: 20px 0;
            }

            .data-table th {
              background: #f9fafb;
              padding: 12px 16px;
              text-align: left;
              font-weight: 600;
              color: #4b5563;
              border-bottom: 2px solid #e5e7eb;
            }

            .data-table td {
              padding: 12px 16px;
              border-bottom: 1px solid #e5e7eb;
            }

            .data-table tr:last-child td {
              border-bottom: none;
            }

            .status-badge {
              display: inline-flex;
              align-items: center;
              padding: 6px 12px;
              border-radius: 9999px;
              font-size: 12px;
              font-weight: 600;
              background: #dcfce7;
              color: #166534;
            }

            .timestamp {
              color: #6b7280;
              font-size: 14px;
              text-align: right;
              margin-top: 20px;
              font-style: italic;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h2>진료 예약 확인</h2>
            </div>
            <div class="email-content">
              <div class="highlight-box">
                <p style="margin: 0; font-size: 16px; font-weight: 500;">
                  ${username} 님의 진료 예약이 완료되었습니다
                </p>
              </div>
              <table class="data-table">
                <thead>
                  <tr>
                    <th>구분</th>
                    <th>정보</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>진료과</strong></td>
                    <td>${appointment.department}</td>
                  </tr>
                  <tr>
                    <td><strong>예약 일시</strong></td>
                    <td>${new Date(appointment.date).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td><strong>상태</strong></td>
                    <td>
                      <span class="status-badge status-pending">예약 완료</span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div class="timestamp">
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
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');

            body {
              font-family: 'Noto Sans KR', sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }

            .email-container {
              max-width: 600px;
              margin: 20px auto;
              background: #ffffff;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }

            .email-header {
              background: linear-gradient(135deg, #4f46e5, #6366f1);
              color: white;
              padding: 30px;
              text-align: center;
            }

            .email-header h2 {
              margin: 0;
              font-size: 24px;
              font-weight: 700;
            }

            .email-content {
              padding: 30px;
              background: #ffffff;
            }

            .highlight-box {
              background: linear-gradient(to right, #f3f4f6, #ffffff);
              border-left: 4px solid #4f46e5;
              padding: 20px;
              margin-bottom: 20px;
              border-radius: 8px;
            }

            .data-table {
              width: 100%;
              border-collapse: separate;
              border-spacing: 0;
              margin: 20px 0;
            }

            .data-table th {
              background: #f9fafb;
              padding: 12px 16px;
              text-align: left;
              font-weight: 600;
              color: #4b5563;
              border-bottom: 2px solid #e5e7eb;
            }

            .data-table td {
              padding: 12px 16px;
              border-bottom: 1px solid #e5e7eb;
            }

            .data-table tr:last-child td {
              border-bottom: none;
            }

            .status-badge {
              display: inline-flex;
              align-items: center;
              padding: 6px 12px;
              border-radius: 9999px;
              font-size: 12px;
              font-weight: 600;
              background: #dcfce7;
              color: #166534;
            }

            .timestamp {
              color: #6b7280;
              font-size: 14px;
              text-align: right;
              margin-top: 20px;
              font-style: italic;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h2>진료 예약 변경 확인</h2>
            </div>
            <div class="email-content">
              <div class="highlight-box">
                <p style="margin: 0; font-size: 16px; font-weight: 500;">
                  ${username} 님의 진료 예약이 변경되었습니다
                </p>
              </div>
              <table class="data-table">
                <thead>
                  <tr>
                    <th>구분</th>
                    <th>정보</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>진료과</strong></td>
                    <td>${appointment.department}</td>
                  </tr>
                  <tr>
                    <td><strong>기존 예약 일시</strong></td>
                    <td>
                      <span style="text-decoration: line-through; color: var(--gray-400);">
                        ${new Date(oldDate).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>변경된 예약 일시</strong></td>
                    <td>${new Date(appointment.date).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td><strong>상태</strong></td>
                    <td>
                      <span class="status-badge status-pending">예약 변경</span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div class="timestamp">
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
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');

            body {
              font-family: 'Noto Sans KR', sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }

            .email-container {
              max-width: 600px;
              margin: 20px auto;
              background: #ffffff;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }

            .email-header {
              background: linear-gradient(135deg, #4f46e5, #6366f1);
              color: white;
              padding: 30px;
              text-align: center;
            }

            .email-header h2 {
              margin: 0;
              font-size: 24px;
              font-weight: 700;
            }

            .email-content {
              padding: 30px;
              background: #ffffff;
            }

            .highlight-box {
              background: linear-gradient(to right, #f3f4f6, #ffffff);
              border-left: 4px solid #4f46e5;
              padding: 20px;
              margin-bottom: 20px;
              border-radius: 8px;
            }

            .data-table {
              width: 100%;
              border-collapse: separate;
              border-spacing: 0;
              margin: 20px 0;
            }

            .data-table th {
              background: #f9fafb;
              padding: 12px 16px;
              text-align: left;
              font-weight: 600;
              color: #4b5563;
              border-bottom: 2px solid #e5e7eb;
            }

            .data-table td {
              padding: 12px 16px;
              border-bottom: 1px solid #e5e7eb;
            }

            .data-table tr:last-child td {
              border-bottom: none;
            }

            .status-badge {
              display: inline-flex;
              align-items: center;
              padding: 6px 12px;
              border-radius: 9999px;
              font-size: 12px;
              font-weight: 600;
              background: #fee2e2;
              color: #991b1b;
            }

            .timestamp {
              color: #6b7280;
              font-size: 14px;
              text-align: right;
              margin-top: 20px;
              font-style: italic;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h2>진료 예약 취소 확인</h2>
            </div>
            <div class="email-content">
              <div class="highlight-box">
                <p style="margin: 0; font-size: 16px; font-weight: 500;">
                  ${username} 님의 진료 예약이 취소되었습니다
                </p>
              </div>
              <table class="data-table">
                <thead>
                  <tr>
                    <th>구분</th>
                    <th>정보</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>진료과</strong></td>
                    <td>${appointment.department}</td>
                  </tr>
                  <tr>
                    <td><strong>취소된 예약 일시</strong></td>
                    <td>
                      <span style="text-decoration: line-through; color: var(--gray-400);">
                        ${new Date(appointment.date).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>상태</strong></td>
                    <td>
                      <span class="status-badge status-cancelled">예약 취소</span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div class="timestamp">
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