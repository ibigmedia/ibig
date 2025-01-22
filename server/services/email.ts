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

export const emailTemplates = {
  medicalRecord: (username: string, action: string, data: any, timestamp: string) => ({
    subject: '의료 기록 업데이트 알림',
    content: {
      text: `사용자의 의료 기록이 ${action}되었습니다.\n\n` +
        `사용자: ${username}\n` +
        `시간: ${timestamp}\n` +
        `변경 내용: ${JSON.stringify(data, null, 2)}`,
      html: generateMedicalRecordEmailHtml(username, action, data, timestamp)
    }
  }),
  
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
      html: generateEmergencyContactEmailHtml(username, contactData, timestamp)
    }
  })
};

function generateMedicalRecordEmailHtml(username: string, action: string, data: any, timestamp: string) {
  const dataRows = Object.entries(data)
    .map(([key, value]) => `
      <tr>
        <td style="padding: 10px; border: 1px solid #e5e7eb;">${key}</td>
        <td style="padding: 10px; border: 1px solid #e5e7eb;">${value}</td>
      </tr>
    `)
    .join('');

  return `
    <div style="font-family: Arial, sans-serif;">
      <h2 style="color: #2563eb;">의료 기록 ${action} 알림</h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr>
          <th style="text-align: left; padding: 10px; background-color: #f3f4f6; border: 1px solid #e5e7eb;">항목</th>
          <th style="text-align: left; padding: 10px; background-color: #f3f4f6; border: 1px solid #e5e7eb;">내용</th>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">사용자</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">${username}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">시간</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">${timestamp}</td>
        </tr>
        ${dataRows}
      </table>
    </div>
  `;
}

function generateEmergencyContactEmailHtml(username: string, contactData: any, timestamp: string) {
  return `
    <div style="font-family: Arial, sans-serif;">
      <h2 style="color: #2563eb;">비상 연락처 추가 알림</h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr>
          <th style="text-align: left; padding: 10px; background-color: #f3f4f6; border: 1px solid #e5e7eb;">항목</th>
          <th style="text-align: left; padding: 10px; background-color: #f3f4f6; border: 1px solid #e5e7eb;">내용</th>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">사용자</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">${username}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">이름</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">${contactData.name}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">관계</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">${contactData.relationship}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">전화번호</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">${contactData.phoneNumber}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">등록시간</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">${timestamp}</td>
        </tr>
      </table>
    </div>
  `;
}
