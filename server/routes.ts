import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { users, appointments, medications, medicalRecords, emergencyContacts } from "@db/schema";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

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
    // Delete existing admin user
    await db.delete(users).where(eq(users.username, 'admin'));

    // Create new admin user with hashed password
    const hashedPassword = await crypto.hash('admin123');
    const [newAdmin] = await db.insert(users)
      .values({
        username: 'admin',
        password: hashedPassword,
        role: 'admin' // Assuming a 'role' column exists in the users table
      })
      .returning();

    console.log('Admin user created successfully');
    return newAdmin;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}

export function registerRoutes(app: Express): Server {
  setupAuth(app);
  createAdminUser().catch(console.error);

  // Admin routes
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
      const [
        userCount,
        todayAppointments,
        activeMedications
      ] = await Promise.all([
        db.select().from(users).execute().then(users => users.length),
        db.select()
          .from(appointments)
          .where(eq(appointments.date, new Date().toISOString().split('T')[0]))
          .execute()
          .then(appointments => appointments.length),
        db.select()
          .from(medications)
          .where(eq(medications.endDate, null))
          .execute()
          .then(medications => medications.length)
      ]);

      res.json({
        totalPatients: userCount,
        todayAppointments,
        activePresciptions: activeMedications
      });
    } catch (error) {
      res.status(500).send("Error fetching statistics");
    }
  });

  // Admin routes for medical records and appointments
  app.get("/api/admin/medical-records", async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).send("Unauthorized");
    }

    try {
      const records = await db.query.medicalRecords.findMany();
      res.json(records);
    } catch (error) {
      res.status(500).send("Error fetching medical records");
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

  // Password change API
  app.post("/api/user/change-password", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("인증되지 않은 사용자입니다");
    }

    const { currentPassword, newPassword } = req.body;

    try {
      // Verify current password
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, req.user.id))
        .limit(1);

      const isMatch = await crypto.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).send("현재 비밀번호가 일치하지 않습니다");
      }

      // Hash new password
      const hashedPassword = await crypto.hash(newPassword);

      // Update password
      await db
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, req.user.id));

      res.json({ message: "비밀번호가 성공적으로 변경되었습니다" });
    } catch (error) {
      res.status(500).send("비밀번호 변경 중 오류가 발생했습니다");
    }
  });

  // Medical Records API
  app.get("/api/medical-records", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    const records = await db.query.medicalRecords.findMany({
      where: eq(medicalRecords.userId, req.user.id),
    });
    res.json(records);
  });

  // Medical History Export API
  app.get("/api/medical-records/export", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      // Fetch all medical related data for the user
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
        patientInfo: records[0], // Basic medical information
        appointments: userAppointments,
        medications: userMedications,
        exportDate: new Date().toISOString(),
      };

      res.json(exportData);
    } catch (error) {
      res.status(500).send("Error exporting medical history");
    }
  });

  // Emergency Contacts API
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
      const [contact] = await db.update(emergencyContacts)
        .set(req.body)
        .where(eq(emergencyContacts.id, parseInt(req.params.id)))
        .returning();
      res.json(contact);
    } catch (error) {
      res.status(500).send("Error updating emergency contact");
    }
  });

  app.put("/api/emergency-contacts/:id/main", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      // First, unset all main contacts
      await db.update(emergencyContacts)
        .set({ isMainContact: false })
        .where(eq(emergencyContacts.userId, req.user.id));

      // Then set the new main contact
      const [contact] = await db.update(emergencyContacts)
        .set({ isMainContact: true })
        .where(eq(emergencyContacts.id, parseInt(req.params.id)))
        .returning();

      res.json(contact);
    } catch (error) {
      res.status(500).send("Error setting main emergency contact");
    }
  });

  // Appointments API
  app.get("/api/appointments", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    const userAppointments = await db.query.appointments.findMany({
      where: eq(appointments.userId, req.user.id),
    });
    res.json(userAppointments);
  });

  // Medications API
  app.get("/api/medications", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    const userMedications = await db.query.medications.findMany({
      where: eq(medications.userId, req.user.id),
    });
    res.json(userMedications);
  });

  const httpServer = createServer(app);
  return httpServer;
}