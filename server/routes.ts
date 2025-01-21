import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { appointments, medications, medicalRecords } from "@db/schema";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

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
