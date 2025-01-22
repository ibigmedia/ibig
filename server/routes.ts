import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import * as adminRoutes from "./routes/admin";
import { getPatientProfile, updatePatientProfile } from "./routes/patient-profile";
import translationRouter from './routes/translation';
import { sendEmail, emailTemplates } from './services/email';
import { db } from "@db";
import { medicalRecords, emergencyContacts, users, appointments, medications, bloodPressureRecords, bloodSugarRecords, diseaseHistories, smtpSettings, invitations, allergyRecords } from "@db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import nodemailer from "nodemailer";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import type { Request, Response, NextFunction } from "express";


const scryptAsync = promisify(scrypt);
const crypto = {
  hash: async (password: string) => {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  },
  compare: async (suppliedPassword: string, storedPassword: string) => {
    const [hashedPassword, salt] = storedPassword.split(".");
    const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
    const suppliedPasswordBuf = (await scryptAsync(
      suppliedPassword,
      salt,
      64
    )) as Buffer;
    return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
  },
  randomBytes
};

async function createAdminUser() {
  try {
    const [existingAdmin] = await db
      .select()
      .from(users)
      .where(eq(users.username, 'admin'))
      .limit(1);

    if (existingAdmin) {
      return existingAdmin;
    }

    const hashedPassword = await crypto.hash('admin123');
    const [newAdmin] = await db.insert(users)
      .values({
        username: 'admin',
        password: hashedPassword,
        role: 'admin'
      })
      .returning();

    console.log('Admin user created successfully');
    return newAdmin;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}

let mailer: nodemailer.Transporter | null = null;

async function setupMailer() {
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

async function sendNotificationEmail(subject: string, content: { text: string, html?: string }, toEmail?: string) {
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
    console.error('Error sending notification email:', error);
  }
}


// Email templates (moved to separate file)
//These functions are now in email.ts

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Patient profile routes
  app.get("/api/patient-profile", getPatientProfile);
  app.put("/api/patient-profile", updatePatientProfile);

  app.use('/api', translationRouter);

  // SMTP Settings Routes
  app.get("/api/admin/smtp-settings", adminRoutes.getSmtpSettings);
  app.post("/api/admin/smtp-settings", adminRoutes.updateSmtpSettings);


  // Admin routes (moved to separate file)
  app.get("/api/admin/users", adminRoutes.getAllUsers);
  app.get("/api/admin/user-details/:userId", adminRoutes.getUserDetails);
  app.get("/api/admin/stats", adminRoutes.getStats);
  app.get("/api/admin/recent-appointments", adminRoutes.getRecentAppointments);
  app.get("/api/admin/medical-records", adminRoutes.getAllMedicalRecords);
  app.get("/api/admin/blood-pressure", adminRoutes.getAllBloodPressureRecords);
  app.get("/api/admin/blood-sugar", adminRoutes.getAllBloodSugarRecords);
  app.get("/api/admin/disease-histories", adminRoutes.getAllDiseaseHistories);
  app.get("/api/admin/appointments", adminRoutes.getAllAppointments);
  app.put("/api/admin/appointments/:id/status", adminRoutes.updateAppointmentStatus);
  app.get("/api/admin/subadmins", adminRoutes.getSubAdmins);
  app.post("/api/admin/invite", adminRoutes.createInvitation);
  app.post("/api/invitations/:token/accept", adminRoutes.acceptInvitation);
  app.get("/api/admin/emergency-contacts", adminRoutes.getAllEmergencyContacts);
  app.delete("/api/admin/emergency-contacts/:id", adminRoutes.deleteEmergencyContact);
  app.put("/api/admin/emergency-contacts/:id", adminRoutes.updateEmergencyContact);


  // Update medical records route with email notification
  app.post("/api/medical-records", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const existingRecord = await db.query.medicalRecords.findFirst({
        where: eq(medicalRecords.userId, req.user.id),
      });

      const record = existingRecord
        ? (await db
            .update(medicalRecords)
            .set({
              ...req.body,
              updatedAt: new Date(),
            })
            .where(eq(medicalRecords.id, existingRecord.id))
            .returning())[0]
        : (await db
            .insert(medicalRecords)
            .values({
              ...req.body,
              userId: req.user.id,
            })
            .returning())[0];

      const timestamp = new Date().toLocaleString('ko-KR');
      const action = existingRecord ? '수정' : '생성';

      // Send email notification
      const emailData = emailTemplates.medicalRecord(
        req.user.username,
        action,
        req.body,
        timestamp
      );
      await sendEmail(emailData.subject, emailData.content);

      res.json(record);
    } catch (error) {
      console.error('Error saving medical record:', error);
      res.status(500).send("Error saving medical record");
    }
  });

  // Update emergency contacts route with email notification
  app.post("/api/emergency-contacts", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const [contact] = await db.insert(emergencyContacts)
        .values({
          ...req.body,
          userId: req.user.id,
        })
        .returning();

      const timestamp = new Date().toLocaleString('ko-KR');

      // Send email notification
      const emailData = emailTemplates.emergencyContact(
        req.user.username,
        contact,
        timestamp
      );
      await sendEmail(emailData.subject, emailData.content);

      res.json(contact);
    } catch (error) {
      console.error('Error creating emergency contact:', error);
      res.status(500).send("Error creating emergency contact");
    }
  });

  app.get("/api/medical-records", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    const records = await db.query.medicalRecords.findMany({
      where: eq(medicalRecords.userId, req.user.id),
    });
    res.json(records);
  });

  app.put("/api/medical-records/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const recordId = parseInt(req.params.id);

      const [existingRecord] = await db
        .select()
        .from(medicalRecords)
        .where(
          and(
            eq(medicalRecords.id, recordId),
            eq(medicalRecords.userId, req.user.id)
          )
        )
        .limit(1);

      if (!existingRecord) {
        return res.status(404).send("Record not found");
      }

      const [updatedRecord] = await db
        .update(medicalRecords)
        .set({
          ...req.body,
          updatedAt: new Date(),
        })
        .where(eq(medicalRecords.id, recordId))
        .returning();

      res.json(updatedRecord);
    } catch (error) {
      console.error('Error updating medical record:', error);
      res.status(500).send("Error updating medical record");
    }
  });

  app.delete("/api/medical-records/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const recordId = parseInt(req.params.id);

      const [existingRecord] = await db
        .select()
        .from(medicalRecords)
        .where(
          and(
            eq(medicalRecords.id, recordId),
            eq(medicalRecords.userId, req.user.id)
          )
        )
        .limit(1);

      if (!existingRecord) {
        return res.status(404).send("Record not found");
      }

      await db
        .delete(medicalRecords)
        .where(eq(medicalRecords.id, recordId));

      res.json({ message: "Record deleted successfully" });
    } catch (error) {
      console.error('Error deleting medical record:', error);
      res.status(500).send("Error deleting medical record");
    }
  });



  app.get("/api/medical-records/export", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const [records, userAppointments, userMedications] = await Promise.all([
        db.query.medicalRecords.findMany({
          where: eq(medicalRecords.userId, req.user.id),
        }),
        db.query.appointments.findMany({
          where: eq(appointments.userId, req.user.id),
        }),
        db.query.medications.findMany({
          where: eq(medications.userId, req.user.id),
        }),
      ]);

      const exportData = {
        patientInfo: records[0],
        appointments: userAppointments,
        medications: userMedications,
        exportDate: new Date().toISOString(),
        exportedBy: req.user.username,
        exportId: crypto.randomBytes(16).toString('hex'),
      };

      // Generate a one-time encryption key
      const exportKey = encryption.generateExportKey();

      // Encrypt the export data
      const encryptedData = encryption.encrypt(exportData);

      // Log the export attempt
      logger.info({
        event: 'medical_record_export',
        userId: req.user.id,
        exportId: exportData.exportId,
        timestamp: new Date().toISOString()
      });

      res.json({
        encryptedData,
        exportKey,
        // Include instructions and metadata
        metadata: {
          exportId: exportData.exportId,
          timestamp: exportData.exportDate,
          format: 'AES-encrypted JSON',
          contentType: 'medical_records_export_v1'
        }
      });
    } catch (error) {
      logger.error('Error exporting medical history:', error);
      res.status(500).send("Error exporting medical history");
    }
  });

  app.post("/api/medical-records/validate-export", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    const { encryptedData, exportKey } = req.body;

    try {
      // Attempt to decrypt and validate the data
      const decryptedData = encryption.decrypt(encryptedData);

      // Verify the data structure
      if (!decryptedData.exportId || !decryptedData.patientInfo) {
        return res.status(400).json({
          valid: false,
          message: "Invalid export data structure"
        });
      }

      res.json({
        valid: true,
        metadata: {
          exportId: decryptedData.exportId,
          exportDate: decryptedData.exportDate,
          patientName: decryptedData.patientInfo.name
        }
      });
    } catch (error) {
      res.status(400).json({
        valid: false,
        message: "Failed to validate exported data"
      });
    }
  });

  app.get("/api/emergency-contacts", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const contacts = await db.query.emergencyContacts.findMany({
        where: eq(emergencyContacts.userId, req.user.id),
      });
      res.json(contacts);
    } catch (error) {
      res.status(500).send("Error fetching emergency contacts");
    }
  });


  app.put("/api/emergency-contacts/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const contactId = parseInt(req.params.id);

      const [existingContact] = await db
        .select()
        .from(emergencyContacts)
        .where(
          and(
            eq(emergencyContacts.id, contactId),
            eq(emergencyContacts.userId, req.user.id)
          )
        )
        .limit(1);


      if (!existingContact) {
        return res.status(404).send("Contact not found");
      }

      const [updatedContact] = await db
        .update(emergencyContacts)
        .set(req.body)
        .where(eq(emergencyContacts.id, contactId))
        .returning();

      res.json(updatedContact);
    } catch (error) {
      res.status(500).send("Error updating emergency contact");
    }
  });

  app.delete("/api/emergency-contacts/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const contactId = parseInt(req.params.id);

      const [existingContact] = await db
        .select()
        .from(emergencyContacts)
        .where(
          and(eq(emergencyContacts.id, contactId),
            eq(emergencyContacts.userId, req.user.id)
          )
        )
        .limit(1);

      if (!existingContact) {
        return res.status(404).send("Contact not found");
      }

      await db
        .delete(emergencyContacts)
        .where(eq(emergencyContacts.id, contactId));

      res.json({ message: "Contact deleted successfully" });
    } catch (error) {
      res.status(500).send("Error deleting emergency contact");
    }
  });

  app.get("/api/appointments", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    const userAppointments = await db.query.appointments.findMany({
      where: eq(appointments.userId, req.user.id),
    });
    res.json(userAppointments);
  });

  app.get("/api/medications", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    const userMedications = await db.query.medications.findMany({
      where: eq(medications.userId, req.user.id),
    });
    res.json(userMedications);
  });

  app.post("/api/appointments", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      console.log('Appointment creation request:', {
        userId: req.user.id,
        ...req.body
      });

      const [appointment] = await db.insert(appointments)
        .values({
          userId: req.user.id,
          date: new Date(req.body.date),
          department: req.body.department,
          status: 'pending'
        })
        .returning();

      console.log('Created appointment:', appointment);
      res.json(appointment);
    } catch (error) {
      console.error('Error creating appointment:', error);
      res.status(500).send(error instanceof Error ? error.message : "Error creating appointment");
    }
  });

  app.post("/api/user/change-password", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("인증되지 않은 사용자입니다");
    }

    const { currentPassword, newPassword } = req.body;

    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, req.user.id))
        .limit(1);

      const isMatch = await crypto.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).send("현재 비밀번호가 일치하지 않습니다");
      }

      const hashedPassword = await crypto.hash(newPassword);

      await db
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, req.user.id));

      res.json({ message: "비밀번호가 성공적으로 변경되었습니다" });
    } catch (error) {
      res.status(500).send("비밀번호 변경 중 오류가 발생했습니다");
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res
          .status(400)
          .send("Invalid input: " + result.error.issues.map(i => i.message).join(", "));
      }

      const { username, password } = result.data;

      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (existingUser) {
        return res.status(400).send("Username already exists");
      }

      const hashedPassword = await crypto.hash(password);

      const [newUser] = await db
        .insert(users)
        .values({
          ...result.data,
          password: hashedPassword,
          role: result.data.role || 'user',
        })
        .returning();

      req.login(newUser, (err) => {
        if (err) {
          return next(err);
        }
        return res.json({
          message: "Registration successful",
          user: { id: newUser.id, username: newUser.username, role: newUser.role },
        });
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/blood-pressure", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const records = await db.query.bloodPressureRecords.findMany({
        where: eq(bloodPressureRecords.userId, req.user.id),
        orderBy: [desc(bloodPressureRecords.measuredAt)],
      });
      res.json(records);
    } catch (error) {
      console.error('Error fetching blood pressure records:', error);
      res.status(500).send("Error fetching blood pressure records");
    }
  });

  app.post("/api/blood-pressure", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const { systolic, diastolic, pulse, notes } = req.body;
      const measuredAt = new Date();

      const [record] = await db
        .insert(bloodPressureRecords)
        .values({
          userId: req.user.id,
          systolic,
          diastolic,
          pulse,
          notes,
          measuredAt,
        })
        .returning();

      res.json(record);
    } catch (error) {
      console.error('Error saving blood pressure record:', error);
      res.status(500).send("Error saving blood pressure record");
    }
  });

  app.get("/api/blood-sugar", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const records = await db.query.bloodSugarRecords.findMany({
        where: eq(bloodSugarRecords.userId, req.user.id),
        orderBy: [desc(bloodSugarRecords.measuredAt)],
      });
      res.json(records);
    } catch (error) {
      console.error('Error fetching blood sugar records:', error);
      res.status(500).send("Error fetching blood sugar records");
    }
  });

  app.post("/api/blood-sugar", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const { bloodSugar, measurementType, notes } = req.body;
      const measuredAt = new Date();

      const [record] = await db
        .insert(bloodSugarRecords)
        .values({
          userId: req.user.id,
          bloodSugar,
          measurementType,
          notes,
          measuredAt,
        })
        .returning();

      res.json(record);
    } catch (error) {
      console.error('Error saving blood sugar record:', error);
      res.status(500).send("Error saving blood sugar record");
    }
  });

  app.get("/api/disease-histories", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const records = await db.query.diseaseHistories.findMany({
        where: eq(diseaseHistories.userId, req.user.id),
        orderBy: [desc(diseaseHistories.createdAt)],
      });
      res.json(records);
    } catch (error) {
      console.error('Error fetching disease histories:', error);
      res.status(500).send("Error fetching disease histories");
    }
  });

  app.post("/api/disease-histories", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const { diseaseName, treatment, notes } = req.body;
      const diagnosisDate = new Date();

      const [record] = await db
        .insert(diseaseHistories)
        .values({
          userId: req.user.id,
          diseaseName,
          treatment,
          diagnosisDate,
          notes,
        })
        .returning();

      res.json(record);
    } catch (error) {
      console.error('Error saving disease history:', error);
      res.status(500).send("Error saving disease history");
    }
  });

  app.get("/api/admin/medications", async (req, res) => {
    if (!req.user || !['admin', 'subadmin'].includes(req.user.role)) {
      return res.status(403).send("Unauthorized");
    }

    try {
      const records = await db.query.medications.findMany({
        orderBy: [desc(medications.createdAt)],
      });
      res.json(records);
    } catch (error) {
      console.error('Error fetching medications:', error);
      res.status(500).send("Error fetching medications");
    }
  });

  app.post("/api/medications", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const { name, dosage, startDate, endDate, frequency, notes } = req.body;
      console.log('Medication data received:', req.body);

      if (!name || !dosage || !startDate || !frequency) {
        return res.status(400).send("필수 입력값이 누락되었습니다");
      }

      const [record] = await db
        .insert(medications)
        .values({
          userId: req.user.id,
          name,
          dosage,
          startDate: new Date(startDate).toISOString(),
          endDate: endDate ? new Date(endDate).toISOString() : null,
          frequency,
          notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .returning();

      console.log('Medication saved:', record);
      res.json(record);
    } catch (error) {
      console.error('Error saving medication:', error);
      res.status(500).send("약물 정보 저장 중 오류가 발생했습니다");
    }
  });

  app.delete("/api/disease-histories/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const recordId = parseInt(req.params.id);

      const [existingRecord] = await db
        .select()
        .from(diseaseHistories)
        .where(
          and(
            eq(diseaseHistories.id, recordId),
            eq(diseaseHistories.userId, req.user.id)
          )
        )
        .limit(1);

      if (!existingRecord) {
        return res.status(404).send("Record not found");
      }

      const [deletedRecord] = await db
        .delete(diseaseHistories)
        .where(
          and(
            eq(diseaseHistories.id, recordId),
            eq(diseaseHistories.userId, req.user.id)
          )
        )
        .returning();

      res.json({ success: true, deletedRecord });
    } catch (error) {
      console.error('Error deleting disease history:', error);
      res.status(500).send("Error deleting disease history");
    }
  });

  app.delete("/api/blood-pressure/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const recordId = parseInt(req.params.id);

      const [existingRecord] = await db
        .select()
        .from(bloodPressureRecords)
        .where(
          and(
            eq(bloodPressureRecords.id, recordId),
            eq(bloodPressureRecords.userId, req.user.id)
          )
        )
        .limit(1);

      if (!existingRecord) {
        return res.status(404).send("Record not found");
      }

      const [deletedRecord] = await db
        .delete(bloodPressureRecords)
        .where(
          and(
            eq(bloodPressureRecords.id, recordId),
            eq(bloodPressureRecords.userId, req.user.id)
          )
        )
        .returning();

      res.json({ success: true, deletedRecord });
    } catch (error) {
      console.error('Error deleting blood pressure record:', error);
      res.status(500).send("Error deleting blood pressure record");
    }
  });

  // Add allergy records routes
  app.get("/api/allergy-records", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const records = await db.query.allergyRecords.findMany({
        where: eq(allergyRecords.userId, req.user.id),
        orderBy: [desc(allergyRecords.recordedAt)],
      });
      res.json(records);
    } catch (error) {
      console.error('Error fetching allergy records:', error);
      res.status(500).send("Error fetching allergy records");
    }
  });

  app.post("/api/allergy-records", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const { allergen, reaction, severity, notes } = req.body;
      const recordedAt = new Date();

      const [record] = await db
        .insert(allergyRecords)
        .values({
          userId: req.user.id,
          allergen,
          reaction,
          severity,
          notes,
          recordedAt,
        })
        .returning();

      res.json(record);
    } catch (error) {
      console.error('Error saving allergy record:', error);
      res.status(500).send("Error saving allergy record");
    }
  });

  app.delete("/api/allergy-records/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const recordId = parseInt(req.params.id);

      const [existingRecord] = await db
        .select()
        .from(allergyRecords)
        .where(
          and(
            eq(allergyRecords.id, recordId),
            eq(allergyRecords.userId, req.user.id)
          )
        )
        .limit(1);

      if (!existingRecord) {
        return res.status(404).send("Record not found");
      }

      const [deletedRecord] = await db
        .delete(allergyRecords)
        .where(
          and(
            eq(allergyRecords.id, recordId),
            eq(allergyRecords.userId, req.user.id)
          )
        )
        .returning();

      res.json({ success: true, deletedRecord });
    } catch (error) {
      console.error('Error deleting allergy record:', error);
      res.status(500).send("Error deleting allergy record");
    }
  });

  createAdminUser().catch(console.error);
  setupMailer().catch(console.error);

  const httpServer = createServer(app);
  return httpServer;
}

// Fix the SQL selection types for admin routes
export const selectMedicalRecordsWithUser = {
  ...medicalRecords,
  user: { username: users.username },
};

export const selectBloodPressureWithUser = {
  ...bloodPressureRecords,
  user: { username: users.username },
};

export const selectBloodSugarWithUser = {
  ...bloodSugarRecords,
  user: { username: users.username },
};

export const selectDiseaseHistoryWithUser = {
  ...diseaseHistories,
  user: { username: users.username },
};

//This function is now in email.ts
// function generateInvitationEmailHtml(invitationUrl: string) {
//   return `
//     <div style="font-family: Arial, sans-serif;">
//       <h2 style="color: #2563eb;">의료 관리 시스템 서브관리자 초대</h2>
//       <p>안녕하세요,</p>
//       <p>의료 관리 시스템의 서브관리자로 초대되었습니다.</p>
//       <p>아래 링크를 클릭하여 계정을 생성하세요.</p>
//       <a href="${invitationUrl}" style="background-color#2563eb; color white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">계정 생성</a>
//       <p>이 링크는 7일간 유효합니다.</p>
//       <p>감사합니다.</p>
//     </div>
//   `;
// }