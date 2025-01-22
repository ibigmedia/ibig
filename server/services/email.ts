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
    .email-container {
      font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
    }
    .email-header {
      text-align: center;
      padding: 20px;
      background: linear-gradient(135deg, #2563eb, #1e40af);
      color: white;
      border-radius: 8px 8px 0 0;
      margin-bottom: 20px;
    }
    .email-content {
      background-color: #f8fafc;
      padding: 20px;
      border-radius: 0 0 8px 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      background-color: white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      overflow: hidden;
    }
    .data-table th {
      background-color: #f1f5f9;
      color: #1e293b;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #e2e8f0;
    }
    .data-table td {
      padding: 12px;
      color: #334155;
      border-bottom: 1px solid #e2e8f0;
    }
    .data-table tr:last-child td {
      border-bottom: none;
    }
    .timestamp {
      color: #64748b;
      font-size: 0.875em;
      text-align: right;
      margin-top: 20px;
    }
    .highlight {
      color: #2563eb;
      font-weight: 600;
    }
    .action-button {
      display: inline-block;
      padding: 10px 20px;
      background-color: #2563eb;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin-top: 20px;
    }
    @media (max-width: 600px) {
      .email-container {
        padding: 10px;
      }
      .data-table th, .data-table td {
        padding: 8px;
        font-size: 0.9em;
      }
    }
  </style>
`;

export const emailTemplates = {
  medicalRecord: (username: string, action: string, data: any, timestamp: string) => {
    const dataRows = Object.entries(data)
      .map(([key, value]) => `
        <tr>
          <td>${key}</td>
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
              <h2 style="margin: 0;">의료 기록 ${action} 알림</h2>
            </div>
            <div class="email-content">
              <p><span class="highlight">사용자:</span> ${username}</p>
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
            <h2 style="margin: 0;">비상 연락처 추가 알림</h2>
          </div>
          <div class="email-content">
            <p><span class="highlight">사용자:</span> ${username}</p>
            <table class="data-table">
              <tbody>
                <tr>
                  <td>이름</td>
                  <td>${contactData.name}</td>
                </tr>
                <tr>
                  <td>관계</td>
                  <td>${contactData.relationship}</td>
                </tr>
                <tr>
                  <td>전화번호</td>
                  <td>${contactData.phoneNumber}</td>
                </tr>
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

  invitation: (invitationUrl: string) => ({
    subject: '의료 관리 시스템 서브관리자 초대',
    content: {
      text: `의료 관리 시스템의 서브관리자로 초대되었습니다.\n\n초대 링크: ${invitationUrl}\n\n이 링크는 7일간 유효합니다.`,
      html: `
        ${baseEmailStyles}
        <div class="email-container">
          <div class="email-header">
            <h2 style="margin: 0;">서브관리자 초대</h2>
          </div>
          <div class="email-content">
            <p>안녕하세요,</p>
            <p>의료 관리 시스템의 서브관리자로 초대되었습니다.</p>
            <p>아래 버튼을 클릭하여 계정을 생성하세요.</p>
            <a href="${invitationUrl}" class="action-button">계정 생성하기</a>
            <p style="margin-top: 20px; color: #64748b;">이 링크는 7일간 유효합니다.</p>
          </div>
        </div>
      `
    }
  })
};