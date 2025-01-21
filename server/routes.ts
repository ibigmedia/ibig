import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { users, appointments, medications, medicalRecords, emergencyContacts, invitations, bloodPressureRecords, bloodSugarRecords, diseaseHistories, smtpSettings } from "@db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import nodemailer from "nodemailer";

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
};

export async function createAdminUser() {
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

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  createAdminUser().catch(console.error);

  app.get("/api/admin/users", async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).send("Unauthorized");
    }

    const allUsers = await db.query.users.findMany();
    res.json(allUsers);
  });

  app.get("/api/admin/user-details/:userId", async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).send("Unauthorized");
    }

    const userId = parseInt(req.params.userId);

    try {
      const [
        userMedicalRecords,
        userAppointments,
        userMedications,
        userEmergencyContacts
      ] = await Promise.all([
        db.query.medicalRecords.findMany({
          where: eq(medicalRecords.userId, userId)
        }),
        db.query.appointments.findMany({
          where: eq(appointments.userId, userId)
        }),
        db.query.medications.findMany({
          where: eq(medications.userId, userId)
        }),
        db.query.emergencyContacts.findMany({
          where: eq(emergencyContacts.userId, userId)
        })
      ]);

      res.json({
        medicalRecords: userMedicalRecords,
        appointments: userAppointments,
        medications: userMedications,
        emergencyContacts: userEmergencyContacts
      });
    } catch (error) {
      res.status(500).send("Error fetching user details");
    }
  });

  app.get("/api/admin/stats", async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).send("Unauthorized");
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        userCount,
        todayAppointments,
        activeMedications
      ] = await Promise.all([
        db.select({ count: sql`count(*)` })
          .from(users)
          .where(eq(users.role, 'user'))
          .then(result => Number(result[0].count)),
        db.select({ count: sql`count(*)` })
          .from(appointments)
          .where(sql`DATE(${appointments.date}) = ${today.toISOString().split('T')[0]}`)
          .then(result => Number(result[0].count)),
        db.select({ count: sql`count(*)` })
          .from(medications)
          .where(
            and(
              sql`${medications.endDate} IS NULL OR ${medications.endDate} >= CURRENT_DATE`,
              sql`${medications.startDate} <= CURRENT_DATE`
            )
          )
          .then(result => Number(result[0].count))
      ]);

      res.json({
        totalPatients: userCount,
        todayAppointments,
        activePresciptions: activeMedications
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).send("Error fetching statistics");
    }
  });

  app.get("/api/admin/medical-records", async (req, res) => {
    if (!req.user || !['admin', 'subadmin'].includes(req.user.role)) {
      return res.status(403).send("Unauthorized");
    }

    try {
      const records = await db
        .select({
          ...medicalRecords,
          user: {
            name: users.username,
          },
        })
        .from(medicalRecords)
        .leftJoin(users, eq(medicalRecords.userId, users.id));
      res.json(records);
    } catch (error) {
      res.status(500).send("Error fetching medical records");
    }
  });

  app.get("/api/admin/blood-pressure", async (req, res) => {
    if (!req.user || !['admin', 'subadmin'].includes(req.user.role)) {
      return res.status(403).send("Unauthorized");
    }

    try {
      const records = await db
        .select({
          ...bloodPressureRecords,
          user: {
            name: users.username,
          },
        })
        .from(bloodPressureRecords)
        .leftJoin(users, eq(bloodPressureRecords.userId, users.id))
        .orderBy(desc(bloodPressureRecords.measuredAt));
      res.json(records);
    } catch (error) {
      res.status(500).send("Error fetching blood pressure records");
    }
  });

  app.get("/api/admin/blood-sugar", async (req, res) => {
    if (!req.user || !['admin', 'subadmin'].includes(req.user.role)) {
      return res.status(403).send("Unauthorized");
    }

    try {
      const records = await db
        .select({
          ...bloodSugarRecords,
          user: {
            name: users.username,
          },
        })
        .from(bloodSugarRecords)
        .leftJoin(users, eq(bloodSugarRecords.userId, users.id))
        .orderBy(desc(bloodSugarRecords.measuredAt));
      res.json(records);
    } catch (error) {
      res.status(500).send("Error fetching blood sugar records");
    }
  });

  app.get("/api/admin/disease-histories", async (req, res) => {
    if (!req.user || !['admin', 'subadmin'].includes(req.user.role)) {
      return res.status(403).send("Unauthorized");
    }

    try {
      const records = await db
        .select({
          ...diseaseHistories,
          user: {
            name: users.username,
          },
        })
        .from(diseaseHistories)
        .leftJoin(users, eq(diseaseHistories.userId, users.id))
        .orderBy(desc(diseaseHistories.createdAt));
      res.json(records);
    } catch (error) {
      res.status(500).send("Error fetching disease histories");
    }
  });

  app.get("/api/admin/appointments", async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).send("Unauthorized");
    }

    try {
      const allAppointments = await db.query.appointments.findMany();
      res.json(allAppointments);
    } catch (error) {
      res.status(500).send("Error fetching appointments");
    }
  });

  app.put("/api/admin/appointments/:id/status", async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).send("Unauthorized");
    }

    const appointmentId = parseInt(req.params.id);
    const { status } = req.body;

    try {
      const [appointment] = await db
        .update(appointments)
        .set({ status })
        .where(eq(appointments.id, appointmentId))
        .returning();
      res.json(appointment);
    } catch (error) {
      res.status(500).send("Error updating appointment status");
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

  app.get("/api/medical-records", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    const records = await db.query.medicalRecords.findMany({
      where: eq(medicalRecords.userId, req.user.id),
    });
    res.json(records);
  });

  app.post("/api/medical-records", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const existingRecord = await db.query.medicalRecords.findFirst({
        where: eq(medicalRecords.userId, req.user.id),
      });

      if (existingRecord) {
        const [updatedRecord] = await db
          .update(medicalRecords)
          .set({
            ...req.body,
            updatedAt: new Date(),
          })
          .where(eq(medicalRecords.id, existingRecord.id))
          .returning();

        return res.json(updatedRecord);
      }

      const [newRecord] = await db
        .insert(medicalRecords)
        .values({
          ...req.body,
          userId: req.user.id,
        })
        .returning();

      res.json(newRecord);
    } catch (error) {
      console.error('Error saving medical record:', error);
      res.status(500).send("Error saving medical record");
    }
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
      };

      res.json(exportData);
    } catch (error) {
      res.status(500).send("Error exporting medical history");
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

      res.json(contact);
    } catch (error) {
      res.status(500).send("Error creating emergency contact");
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
          and(
            eq(emergencyContacts.id, contactId),
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

  app.get("/api/admin/subadmins", async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).send("Unauthorized");
    }

    try {
      const subadmins = await db.query.users.findMany({
        where: eq(users.role, 'subadmin'),
      });
      res.json(subadmins);
    } catch (error) {
      res.status(500).send("Error fetching sub-admins");
    }
  });

  app.post("/api/admin/invite", async (req, res) => {
    if (!req.user || !['admin', 'subadmin'].includes(req.user.role)) {
      return res.status(403).send("Unauthorized");
    }

    const { email, role } = req.body;
    if (!email || !role || !['user', 'subadmin'].includes(role)) {
      return res.status(400).send("Invalid input");
    }

    if (req.user.role === 'subadmin' && role === 'subadmin') {
      return res.status(403).send("Sub-admins cannot invite other sub-admins");
    }

    try {
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser) {
        return res.status(400).send("User with this email already exists");
      }

      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); 

      const [invitation] = await db
        .insert(invitations)
        .values({
          email,
          role,
          token,
          expiresAt,
          createdById: req.user.id,
        })
        .returning();

      res.json({
        message: "Invitation created successfully",
        invitationUrl: `${req.protocol}://${req.get('host')}/register?token=${token}`,
        expiresAt
      });
    } catch (error) {
      console.error('Error creating invitation:', error);
      res.status(500).send("Error creating invitation");
    }
  });

  app.post("/api/invitations/:token/accept", async (req, res) => {
    const { token } = req.params;
    const { username, password } = req.body;

    try {
      const [invitation] = await db
        .select()
        .from(invitations)
        .where(
          and(
            eq(invitations.token, token),
            sql`${invitations.expiresAt} > NOW()`
          )
        )
        .limit(1);

      if (!invitation) {
        return res.status(400).send("Invalid or expired invitation");
      }

      const hashedPassword = await crypto.hash(password);
      const [user] = await db
        .insert(users)
        .values({
          username,
          password: hashedPassword,
          email: invitation.email,
          role: invitation.role,
        })
        .returning();

      await db
        .delete(invitations)
        .where(eq(invitations.id, invitation.id));

      req.login(user, (err) => {
        if (err) {
          return res.status(500).send("Error logging in");
        }
        res.json({ message: "Account created successfully" });
      });
    } catch (error) {
      res.status(500).send("Error accepting invitation");
    }
  });

  app.get("/api/admin/emergency-contacts", async (req, res) => {
    if (!req.user || !['admin', 'subadmin'].includes(req.user.role)) {
      return res.status(403).send("Unauthorized");
    }

    try {
      const contacts = await db
        .select({
          id: emergencyContacts.id,
          userId: emergencyContacts.userId,
          name: emergencyContacts.name,
          relationship: emergencyContacts.relationship,
          phoneNumber: emergencyContacts.phoneNumber,
          email: emergencyContacts.email,
          isMainContact: emergencyContacts.isMainContact,
          createdAt: emergencyContacts.createdAt,
          updatedAt: emergencyContacts.updatedAt,
          user: {
            username: users.username,
            email: users.email,
          },
        })
        .from(emergencyContacts)
        .leftJoin(users, eq(emergencyContacts.userId, users.id));

      res.json(contacts);
    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
      res.status(500).send("Error fetching emergency contacts");
    }
  });

  app.delete("/api/admin/emergency-contacts/:id", async (req, res) => {
    if (!req.user || !['admin', 'subadmin'].includes(req.user.role)) {
      return res.status(403).send("Unauthorized");
    }

    try {
      const [deletedContact] = await db
        .delete(emergencyContacts)
        .where(eq(emergencyContacts.id, parseInt(req.params.id)))
        .returning();

      res.json(deletedContact);
    } catch (error) {
      res.status(500).send("Error deleting emergency contact");
    }
  });

  app.put("/api/admin/emergency-contacts/:id", async (req, res) => {
    if (!req.user || !['admin', 'subadmin'].includes(req.user.role)) {
      return res.status(403).send("Unauthorized");
    }

    try {
      if (req.body.userId) {
        const existingContact = await db.query.emergencyContacts.findFirst({
          where: and(
            eq(emergencyContacts.userId, req.body.userId),
            sql`${emergencyContacts.id} != ${parseInt(req.params.id)}`
          ),
        });

        if (existingContact) {
          return res.status(400).send("User already has an emergency contact");
        }
      }

      const [updatedContact] = await db
        .update(emergencyContacts)
        .set(req.body)
        .where(eq(emergencyContacts.id, parseInt(req.params.id)))
        .returning();

      res.json(updatedContact);
    } catch (error) {
      res.status(500).send("Error updating emergency contact");
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

  app.get("/api/admin/smtp-settings", async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).send("Unauthorized");
    }

    try {
      const [settings] = await db
        .select({
          id: smtpSettings.id,
          host: smtpSettings.host,
          port: smtpSettings.port,
          username: smtpSettings.username,
          fromEmail: smtpSettings.fromEmail,
        })
        .from(smtpSettings)
        .limit(1);

      res.json(settings || null);
    } catch (error) {
      res.status(500).send("Error fetching SMTP settings");
    }
  });

  app.post("/api/admin/smtp-settings", async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).send("Unauthorized");
    }

    try {
      const { host, port, username, password, fromEmail } = req.body;

      if (!host || !port || !username || !fromEmail) {
        return res.status(400).send("Missing required fields");
      }

      const [existingSettings] = await db
        .select()
        .from(smtpSettings)
        .limit(1);

      let settings;
      if (existingSettings) {
        [settings] = await db
          .update(smtpSettings)
          .set({
            host,
            port,
            username,
            ...(password ? { password } : {}),
            fromEmail,
            updatedAt: new Date(),
          })
          .where(eq(smtpSettings.id, existingSettings.id))
          .returning();
      } else {
        if (!password) {
          return res.status(400).send("Password is required for initial setup");
        }

        [settings] = await db
          .insert(smtpSettings)
          .values({
            host,
            port,
            username,
            password,
            fromEmail,
          })
          .returning();
      }

      await setupMailer();

      res.json({
        id: settings.id,
        host: settings.host,
        port: settings.port,
        username: settings.username,
        fromEmail: settings.fromEmail,
      });
    } catch (error) {
      console.error('Error saving SMTP settings:', error);
      res.status(500).send("Error saving SMTP settings");
    }
  });

  setupMailer().catch(console.error);

  const httpServer = createServer(app);
  return httpServer;
}