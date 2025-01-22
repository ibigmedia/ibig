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
      --primary-gradient: linear-gradient(135deg, #4f46e5, #3730a3);
      --secondary-gradient: linear-gradient(135deg, #f0f9ff, #e0f2fe);
      --success-gradient: linear-gradient(135deg, #dcfce7, #bbf7d0);
      --warning-gradient: linear-gradient(135deg, #fef9c3, #fde68a);
      --danger-gradient: linear-gradient(135deg, #fee2e2, #fecaca);
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .email-container {
      font-family: 'Noto Sans KR', Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 24px;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    .email-header {
      text-align: center;
      padding: 32px;
      background: var(--primary-gradient);
      color: white;
      border-radius: 12px;
      margin-bottom: 24px;
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
      background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
      z-index: 1;
    }

    .email-header h2 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.5px;
      position: relative;
      z-index: 2;
    }

    .email-content {
      background: var(--secondary-gradient);
      padding: 32px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .data-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin: 24px 0;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .data-table th {
      background: rgba(255, 255, 255, 0.95);
      color: #1e293b;
      padding: 16px 24px;
      text-align: left;
      font-weight: 600;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #e2e8f0;
      text-transform: uppercase;
      font-size: 12px;
    }

    .data-table td {
      padding: 16px 24px;
      color: #334155;
      border-bottom: 1px solid rgba(226, 232, 240, 0.5);
      transition: background-color 0.2s ease;
    }

    .data-table tr:last-child td {
      border-bottom: none;
    }

    .data-table tr:hover td {
      background-color: rgba(248, 250, 252, 0.8);
    }

    .timestamp {
      color: #64748b;
      font-size: 0.875em;
      text-align: right;
      margin-top: 24px;
      font-style: italic;
      padding: 12px;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 8px;
    }

    .highlight {
      color: #4f46e5;
      font-weight: 600;
      font-size: 1.125em;
      line-height: 1.5;
      margin-bottom: 24px;
      padding: 16px 24px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 12px;
      border-left: 4px solid #4f46e5;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 6px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .status-badge::before {
      content: '';
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      margin-right: 8px;
    }

    .status-active {
      background: var(--success-gradient);
      color: #166534;
    }

    .status-active::before {
      background: #166534;
    }

    .status-pending {
      background: var(--warning-gradient);
      color: #854d0e;
    }

    .status-pending::before {
      background: #854d0e;
    }

    .status-completed {
      background: var(--secondary-gradient);
      color: #075985;
    }

    .status-completed::before {
      background: #075985;
    }

    .status-cancelled {
      background: var(--danger-gradient);
      color: #991b1b;
    }

    .status-cancelled::before {
      background: #991b1b;
    }

    .strike-through {
      text-decoration: line-through;
      color: #94a3b8;
    }

    @media (max-width: 640px) {
      .email-container {
        padding: 16px;
      }

      .email-header {
        padding: 24px;
      }

      .email-header h2 {
        font-size: 24px;
      }

      .email-content {
        padding: 20px;
      }

      .data-table th,
      .data-table td {
        padding: 12px 16px;
      }

      .highlight {
        padding: 12px 16px;
        font-size: 1em;
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
          <div class="email-container">
            <div class="email-header">
              <h2>의료 기록 ${action} 알림</h2>
            </div>
            <div class="email-content">
              <div class="highlight">
                ${username} 님의 의료 기록이 업데이트되었습니다
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
        <div class="email-container">
          <div class="email-header">
            <h2>비상 연락처 추가 알림</h2>
          </div>
          <div class="email-content">
            <div class="highlight">
              ${username} 님이 새로운 비상 연락처를 추가했습니다
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
            <div class="timestamp">
              등록 시간: ${timestamp}
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
        <div class="email-container">
          <div class="email-header">
            <h2>진료 예약 확인</h2>
          </div>
          <div class="email-content">
            <div class="highlight">
              ${username} 님의 진료 예약이 완료되었습니다
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
        <div class="email-container">
          <div class="email-header">
            <h2>진료 예약 변경 확인</h2>
          </div>
          <div class="email-content">
            <div class="highlight">
              ${username} 님의 진료 예약이 변경되었습니다
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
                    <span class="strike-through">
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
        <div class="email-container">
          <div class="email-header">
            <h2>진료 예약 취소 확인</h2>
          </div>
          <div class="email-content">
            <div class="highlight">
              ${username} 님의 진료 예약이 취소되었습니다
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
                    <span class="strike-through">
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
      `
    }
  }),
};