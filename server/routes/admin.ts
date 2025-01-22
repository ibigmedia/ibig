import { type Request, Response } from "express";
import { db } from "@db";
import { smtpSettings, users, appointments, medicalRecords, bloodPressureRecords, bloodSugarRecords, diseaseHistories, emergencyContacts, invitations } from "@db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { setupMailer } from "../services/email";
import { randomBytes } from "crypto";

export async function getSmtpSettings(req: Request, res: Response) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).send("Unauthorized");
  }

  try {
    const [settings] = await db
      .select()
      .from(smtpSettings)
      .limit(1);

    res.json(settings);
  } catch (error) {
    console.error('Error fetching SMTP settings:', error);
    res.status(500).send("Error fetching SMTP settings");
  }
}

export async function updateSmtpSettings(req: Request, res: Response) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).send("Unauthorized");
  }

  try {
    const [existingSettings] = await db
      .select()
      .from(smtpSettings)
      .limit(1);

    const { host, port, username, password, fromEmail } = req.body;

    if (existingSettings) {
      const updateData = {
        host,
        port,
        username,
        fromEmail,
        ...(password ? { password } : {}),
        updatedAt: new Date(),
      };

      const [settings] = await db
        .update(smtpSettings)
        .set(updateData)
        .where(eq(smtpSettings.id, existingSettings.id))
        .returning();

      res.json(settings);
    } else {
      if (!password) {
        return res.status(400).send("Password is required for initial setup");
      }

      const [settings] = await db
        .insert(smtpSettings)
        .values({
          host,
          port,
          username,
          password,
          fromEmail,
        })
        .returning();

      res.json(settings);
    }

    // Recreate the mailer with new settings
    await setupMailer();
  } catch (error) {
    console.error('Error updating SMTP settings:', error);
    res.status(500).send("Error updating SMTP settings");
  }
}

export async function getAllUsers(req: Request, res: Response) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).send("Unauthorized");
  }

  const allUsers = await db.query.users.findMany();
  res.json(allUsers);
}

export async function getUserDetails(req: Request, res: Response) {
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
}

export async function getStats(req: Request, res: Response) {
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
        .from(medicalRecords)
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
}

export async function getRecentAppointments(req: Request, res: Response) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).send("Unauthorized");
  }

  try {
    const recentAppointments = await db
      .select({
        id: appointments.id,
        patientName: users.username,
        date: appointments.date,
        department: appointments.department,
        status: appointments.status,
      })
      .from(appointments)
      .leftJoin(users, eq(appointments.userId, users.id))
      .orderBy(desc(appointments.date))
      .limit(5);

    res.json(recentAppointments);
  } catch (error) {
    console.error('Error fetching recent appointments:', error);
    res.status(500).send("Error fetching recent appointments");
  }
}

export async function getAllMedicalRecords(req: Request, res: Response) {
  if (!req.user || !['admin', 'subadmin'].includes(req.user.role)) {
    return res.status(403).send("Unauthorized");
  }

  try {
    const records = await db
      .select({
        ...medicalRecords,
        user: {
          username: users.username,
        },
      })
      .from(medicalRecords)
      .leftJoin(users, eq(medicalRecords.userId, users.id));
    res.json(records);
  } catch (error) {
    res.status(500).send("Error fetching medical records");
  }
}

export async function getAllBloodPressureRecords(req: Request, res: Response) {
  if (!req.user || !['admin', 'subadmin'].includes(req.user.role)) {
    return res.status(403).send("Unauthorized");
  }

  try {
    const records = await db
      .select({
        ...bloodPressureRecords,
        user: {
          username: users.username,
        },
      })
      .from(bloodPressureRecords)
      .leftJoin(users, eq(bloodPressureRecords.userId, users.id))
      .orderBy(desc(bloodPressureRecords.measuredAt));
    res.json(records);
  } catch (error) {
    res.status(500).send("Error fetching blood pressure records");
  }
}

export async function getAllBloodSugarRecords(req: Request, res: Response) {
  if (!req.user || !['admin', 'subadmin'].includes(req.user.role)) {
    return res.status(403).send("Unauthorized");
  }

  try {
    const records = await db
      .select({
        ...bloodSugarRecords,
        user: {
          username: users.username,
        },
      })
      .from(bloodSugarRecords)
      .leftJoin(users, eq(bloodSugarRecords.userId, users.id))
      .orderBy(desc(bloodSugarRecords.measuredAt));
    res.json(records);
  } catch (error) {
    res.status(500).send("Error fetching blood sugar records");
  }
}

export async function getAllDiseaseHistories(req: Request, res: Response) {
  if (!req.user || !['admin', 'subadmin'].includes(req.user.role)) {
    return res.status(403).send("Unauthorized");
  }

  try {
    const records = await db
      .select({
        ...diseaseHistories,
        user: {
          username: users.username,
        },
      })
      .from(diseaseHistories)
      .leftJoin(users, eq(diseaseHistories.userId, users.id))
      .orderBy(desc(diseaseHistories.createdAt));
    res.json(records);
  } catch (error) {
    res.status(500).send("Error fetching disease histories");
  }
}

export async function getAllAppointments(req: Request, res: Response) {
  if (!req.user || !['admin', 'subadmin'].includes(req.user.role)) {
    return res.status(403).send("Unauthorized");
  }

  try {
    const allAppointments = await db
      .select({
        id: appointments.id,
        userId: appointments.userId,
        date: appointments.date,
        department: appointments.department,
        status: appointments.status,
        user: {
          username: users.username,
        },
      })
      .from(appointments)
      .leftJoin(users, eq(appointments.userId, users.id));

    res.json(allAppointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).send("Error fetching appointments");
  }
}

export async function updateAppointmentStatus(req: Request, res: Response) {
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
}

export async function getSubAdmins(req: Request, res: Response) {
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
}

export async function createInvitation(req: Request, res: Response) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).send("Unauthorized");
  }

  const { email, role } = req.body;
  if (!email || !role || !['user', 'subadmin'].includes(role)) {
    return res.status(400).send("Invalid input");
  }

  try {
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
      invitation
    });
  } catch (error) {
    console.error('Error creating invitation:', error);
    res.status(500).send("Error creating invitation");
  }
}

export async function acceptInvitation(req: Request, res: Response) {
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

    res.json({ message: "Invitation is valid" });
  } catch (error) {
    res.status(500).send("Error accepting invitation");
  }
}

export async function getAllEmergencyContacts(req: Request, res: Response) {
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
        user: {
          username: users.username,
        },
      })
      .from(emergencyContacts)
      .leftJoin(users, eq(emergencyContacts.userId, users.id));

    res.json(contacts);
  } catch (error) {
    console.error('Error fetching emergency contacts:', error);
    res.status(500).send("Error fetching emergency contacts");
  }
}

export async function deleteEmergencyContact(req: Request, res: Response) {
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
}

export async function updateEmergencyContact(req: Request, res: Response) {
  if (!req.user || !['admin', 'subadmin'].includes(req.user.role)) {
    return res.status(403).send("Unauthorized");
  }

  try {
    const [updatedContact] = await db
      .update(emergencyContacts)
      .set(req.body)
      .where(eq(emergencyContacts.id, parseInt(req.params.id)))
      .returning();

    res.json(updatedContact);
  } catch (error) {
    res.status(500).send("Error updating emergency contact");
  }
}