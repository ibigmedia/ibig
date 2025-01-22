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

    await mailer.sendMail({
      from: settings.fromEmail,
      to: recipient,
      subject,
      text: content.text,
      html: content.html || content.text,
    });

    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

const baseEmailStyles = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap');

    :root {
      --primary: #4f46e5;
      --primary-light: #6366f1;
      --secondary: #f3f4f6;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
      --gray-50: #f9fafb;
      --gray-100: #f3f4f6;
      --gray-200: #e5e7eb;
      --gray-300: #d1d5db;
      --gray-400: #9ca3af;
      --gray-500: #6b7280;
      --gray-600: #4b5563;
      --gray-700: #374151;
      --gray-800: #1f2937;
      --gray-900: #111827;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.5;
      color: var(--gray-800);
      background-color: var(--gray-50);
    }

    .email-wrapper {
      width: 100%;
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      padding: 40px 20px;
    }

    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 
        0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06),
        0 0 0 1px rgba(0, 0, 0, 0.05);
    }

    .email-header {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
      padding: 32px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .email-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 60%);
    }

    .email-header h2 {
      color: #ffffff;
      font-size: 24px;
      font-weight: 700;
      margin: 0;
      position: relative;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      letter-spacing: -0.025em;
    }

    .email-content {
      padding: 32px;
      background: #ffffff;
    }

    .highlight-box {
      background: linear-gradient(to right, var(--gray-50), #ffffff);
      border-left: 4px solid var(--primary);
      padding: 20px 24px;
      margin-bottom: 24px;
      border-radius: 8px;
    }

    .highlight-box p {
      color: var(--gray-800);
      font-size: 16px;
      font-weight: 500;
      margin: 0;
    }

    .data-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin: 24px 0;
      font-size: 14px;
    }

    .data-table th {
      background: var(--gray-50);
      color: var(--gray-600);
      font-weight: 600;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 0.05em;
      padding: 12px 16px;
      text-align: left;
      border-bottom: 2px solid var(--gray-200);
    }

    .data-table td {
      padding: 16px;
      color: var(--gray-700);
      border-bottom: 1px solid var(--gray-200);
      vertical-align: middle;
    }

    .data-table tr:last-child td {
      border-bottom: none;
    }

    .data-table tr:hover td {
      background-color: var(--gray-50);
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 6px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.025em;
    }

    .status-badge::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      margin-right: 8px;
      background: currentColor;
      opacity: 0.8;
    }

    .status-active {
      background: #dcfce7;
      color: #166534;
    }

    .status-pending {
      background: #fef9c3;
      color: #854d0e;
    }

    .status-completed {
      background: #e0f2fe;
      color: #075985;
    }

    .status-cancelled {
      background: #fee2e2;
      color: #991b1b;
    }

    .footer {
      padding: 24px 32px;
      background: var(--gray-50);
      border-top: 1px solid var(--gray-200);
    }

    .timestamp {
      color: var(--gray-500);
      font-size: 13px;
      text-align: center;
      font-style: italic;
    }

    .divider {
      height: 1px;
      background: var(--gray-200);
      margin: 24px 0;
    }

    @media (max-width: 640px) {
      .email-wrapper {
        padding: 20px 16px;
      }

      .email-container {
        border-radius: 12px;
      }

      .email-header {
        padding: 24px 20px;
      }

      .email-header h2 {
        font-size: 20px;
      }

      .email-content {
        padding: 24px 20px;
      }

      .highlight-box {
        padding: 16px 20px;
      }

      .data-table th,
      .data-table td {
        padding: 12px;
      }

      .footer {
        padding: 20px;
      }
    }
  </style>
`;

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
          ${baseEmailStyles}
          <div class="email-wrapper">
            <div class="email-container">
              <div class="email-header">
                <h2>의료 기록 ${action} 알림</h2>
              </div>
              <div class="email-content">
                <div class="highlight-box">
                  <p>${username} 님의 의료 기록이 업데이트되었습니다</p>
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
                <div class="divider"></div>
                <div class="footer">
                  <div class="timestamp">
                    업데이트 시간: ${timestamp}
                  </div>
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
        ${baseEmailStyles}
        <div class="email-wrapper">
          <div class="email-container">
            <div class="email-header">
              <h2>비상 연락처 추가 알림</h2>
            </div>
            <div class="email-content">
              <div class="highlight-box">
                <p>${username} 님이 새로운 비상 연락처를 추가했습니다</p>
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
                      <span class="status-badge status-active">주 연락처</span>
                    </td>
                  </tr>
                  ` : ''}
                </tbody>
              </table>
              <div class="divider"></div>
              <div class="footer">
                <div class="timestamp">
                  등록 시간: ${timestamp}
                </div>
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
        ${baseEmailStyles}
        <div class="email-wrapper">
          <div class="email-container">
            <div class="email-header">
              <h2>진료 예약 확인</h2>
            </div>
            <div class="email-content">
              <div class="highlight-box">
                <p>${username} 님의 진료 예약이 완료되었습니다</p>
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
              <div class="divider"></div>
              <div class="footer">
                <div class="timestamp">
                  예약 시간: ${new Date().toLocaleString()}
                </div>
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
        ${baseEmailStyles}
        <div class="email-wrapper">
          <div class="email-container">
            <div class="email-header">
              <h2>진료 예약 변경 확인</h2>
            </div>
            <div class="email-content">
              <div class="highlight-box">
                <p>${username} 님의 진료 예약이 변경되었습니다</p>
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
              <div class="divider"></div>
              <div class="footer">
                <div class="timestamp">
                  변경 시간: ${new Date().toLocaleString()}
                </div>
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
        ${baseEmailStyles}
        <div class="email-wrapper">
          <div class="email-container">
            <div class="email-header">
              <h2>진료 예약 취소 확인</h2>
            </div>
            <div class="email-content">
              <div class="highlight-box">
                <p>${username} 님의 진료 예약이 취소되었습니다</p>
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
              <div class="divider"></div>
              <div class="footer">
                <div class="timestamp">
                  취소 시간: ${new Date().toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      `
    }
  }),
};