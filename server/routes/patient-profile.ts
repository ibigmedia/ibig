import { Request, Response } from "express";
import { db } from "@db";
import { patientProfiles, insertPatientProfileSchema } from "@db/schema";
import { eq } from "drizzle-orm";

export async function getPatientProfile(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).send("Not authenticated");
  }

  try {
    const [profile] = await db
      .select()
      .from(patientProfiles)
      .where(eq(patientProfiles.userId, req.user.id))
      .limit(1);

    res.json(profile || null);
  } catch (error) {
    console.error("Error fetching patient profile:", error);
    res.status(500).send("Failed to fetch patient profile");
  }
}

export async function updatePatientProfile(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).send("Not authenticated");
  }

  try {
    const result = insertPatientProfileSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Invalid input",
        details: result.error.issues,
      });
    }

    const [existingProfile] = await db
      .select()
      .from(patientProfiles)
      .where(eq(patientProfiles.userId, req.user.id))
      .limit(1);

    let profile;
    if (existingProfile) {
      [profile] = await db
        .update(patientProfiles)
        .set({
          ...result.data,
          updatedAt: new Date(),
        })
        .where(eq(patientProfiles.userId, req.user.id))
        .returning();
    } else {
      [profile] = await db
        .insert(patientProfiles)
        .values({
          ...result.data,
          userId: req.user.id,
        })
        .returning();
    }

    res.json(profile);
  } catch (error) {
    console.error("Error updating patient profile:", error);
    res.status(500).send("Failed to update patient profile");
  }
}
