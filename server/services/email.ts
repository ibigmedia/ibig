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

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .email-container {
      font-family: 'Noto Sans KR', Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .email-header {
      text-align: center;
      padding: 24px;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: white;
      border-radius: 8px 8px 0 0;
      margin-bottom: 24px;
    }

    .email-header h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
    }

    .email-content {
      background-color: #f8fafc;
      padding: 24px;
      border-radius: 0 0 8px 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .data-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin: 16px 0;
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .data-table th {
      background-color: #f1f5f9;
      color: #1e293b;
      padding: 16px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #e2e8f0;
      white-space: nowrap;
    }

    .data-table td {
      padding: 16px;
      color: #334155;
      border-bottom: 1px solid #e2e8f0;
    }

    .data-table tr:last-child td {
      border-bottom: none;
    }

    .data-table tr:hover td {
      background-color: #f8fafc;
    }

    .timestamp {
      color: #64748b;
      font-size: 0.875em;
      text-align: right;
      margin-top: 20px;
      font-style: italic;
    }

    .highlight {
      color: #2563eb;
      font-weight: 600;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status-active {
      background-color: #dcfce7;
      color: #166534;
    }

    .status-pending {
      background-color: #fef9c3;
      color: #854d0e;
    }

    .status-completed {
      background-color: #e0f2fe;
      color: #075985;
    }

    @media (max-width: 640px) {
      .email-container {
        padding: 12px;
      }

      .email-header {
        padding: 16px;
      }

      .email-content {
        padding: 16px;
      }

      .data-table th,
      .data-table td {
        padding: 12px;
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
              <p class="highlight" style="font-size: 18px; margin-bottom: 16px;">
                ${username} 님의 의료 기록이 업데이트되었습니다
              </p>
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
            <p class="highlight" style="font-size: 18px; margin-bottom: 16px;">
              ${username} 님이 새로운 비상 연락처를 추가했습니다
            </p>
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
            <p class="highlight" style="font-size: 18px; margin-bottom: 16px;">
              ${username} 님의 진료 예약이 완료되었습니다
            </p>
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
            <p class="highlight" style="font-size: 18px; margin-bottom: 16px;">
              ${username} 님의 진료 예약이 변경되었습니다
            </p>
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
                    <span style="text-decoration: line-through; color: #94a3b8;">
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
            <p class="highlight" style="font-size: 18px; margin-bottom: 16px;">
              ${username} 님의 진료 예약이 취소되었습니다
            </p>
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
                    <span style="text-decoration: line-through; color: #94a3b8;">
                      ${new Date(appointment.date).toLocaleString()}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td><strong>상태</strong></td>
                  <td>
                    <span class="status-badge" style="background-color: #fee2e2; color: #991b1b;">
                      예약 취소
                    </span>
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