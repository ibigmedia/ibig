import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from 'drizzle-orm';
import { z } from 'zod';

// Define role type
export const UserRole = z.enum(['admin', 'subadmin', 'user']);
export type UserRole = z.infer<typeof UserRole>;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  email: text("email").unique(),
  role: text("role").$type<UserRole>().notNull().default('user'),
});

// Create a base schema for user validation
const userBaseSchema = {
  username: z.string().min(3, "아이디는 최소 3자 이상이어야 합니다"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
  email: z.string().email().optional(),
  role: UserRole.optional(),
};

// Schema for users
export const insertUserSchema = z.object(userBaseSchema);
export const selectUserSchema = createSelectSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type SelectUser = typeof users.$inferSelect;

export const medicalRecords = pgTable("medical_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  birthDate: text("birth_date").notNull(),
  isDiabetic: boolean("is_diabetic").default(false),
  notes: text("notes"),
  drugAllergies: text("drug_allergies"),
  foodAllergies: text("food_allergies"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const diseaseHistories = pgTable("disease_histories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  diseaseName: text("disease_name").notNull(),
  diagnosisDate: timestamp("diagnosis_date").notNull(),
  treatment: text("treatment"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bloodPressureRecords = pgTable("blood_pressure_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  systolic: integer("systolic").notNull(),
  diastolic: integer("diastolic").notNull(),
  pulse: integer("pulse").notNull(),
  measuredAt: timestamp("measured_at").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bloodSugarRecords = pgTable("blood_sugar_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  bloodSugar: integer("blood_sugar").notNull(),
  measurementType: text("measurement_type").notNull(),
  measuredAt: timestamp("measured_at").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  department: text("department").notNull(),
  status: text("status").notNull().default('pending'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  dosage: text("dosage").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  frequency: text("frequency").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emergencyContacts = pgTable("emergency_contacts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  relationship: text("relationship").notNull(),
  phoneNumber: text("phone_number").notNull(),
  email: text("email"),
  isMainContact: boolean("is_main_contact").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const invitations = pgTable("invitations", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  role: text("role").$type<UserRole>().notNull(),
  token: text("token").unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  createdById: integer("created_by_id").notNull().references(() => users.id),
});

export const smtpSettings = pgTable("smtp_settings", {
  id: serial("id").primaryKey(),
  host: text("host").notNull(),
  port: integer("port").notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  fromEmail: text("from_email").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema for medical records
export const insertMedicalRecordSchema = createInsertSchema(medicalRecords);
export const selectMedicalRecordSchema = createSelectSchema(medicalRecords);
export type InsertMedicalRecord = typeof medicalRecords.$inferInsert;
export type SelectMedicalRecord = typeof medicalRecords.$inferSelect;


// Create schemas for medications
export const insertMedicationSchema = createInsertSchema(medications);
export const selectMedicationSchema = createSelectSchema(medications);
export type InsertMedication = typeof medications.$inferInsert;
export type SelectMedication = typeof medications.$inferSelect;


// Create schemas for SMTP settings
export const insertSmtpSettingsSchema = createInsertSchema(smtpSettings);
export const selectSmtpSettingsSchema = createSelectSchema(smtpSettings);
export type InsertSmtpSettings = typeof smtpSettings.$inferInsert;
export type SelectSmtpSettings = typeof smtpSettings.$inferSelect;

// Define communication preference type
export const CommunicationType = z.enum(['email', 'sms', 'phone', 'kakao']);
export type CommunicationType = z.infer<typeof CommunicationType>;

export const patientProfiles = pgTable("patient_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  preferredName: text("preferred_name"),
  preferredLanguage: text("preferred_language").default('ko').notNull(),
  primaryCommunicationMethod: text("primary_communication_method").$type<CommunicationType>().notNull(),
  secondaryCommunicationMethod: text("secondary_communication_method").$type<CommunicationType>(),
  contactDetails: jsonb("contact_details").notNull(),
  communicationPreferences: jsonb("communication_preferences").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Create schemas for patient profiles
export const insertPatientProfileSchema = createInsertSchema(patientProfiles, {
  contactDetails: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    kakaoId: z.string().optional(),
  }),
  communicationPreferences: z.object({
    appointmentReminders: z.boolean().default(true),
    medicationReminders: z.boolean().default(true),
    newsletterSubscription: z.boolean().default(false),
    preferredContactTime: z.enum(['morning', 'afternoon', 'evening']).optional(),
  }),
});

export const selectPatientProfileSchema = createSelectSchema(patientProfiles);
export type InsertPatientProfile = z.infer<typeof insertPatientProfileSchema>;
export type SelectPatientProfile = typeof patientProfiles.$inferSelect;

// Add the relationship to users relations
export const usersRelations = relations(users, ({ one, many }) => ({
  patientProfile: one(patientProfiles, {
    fields: [users.id],
    references: [patientProfiles.userId],
  }),
  medicalRecords: many(medicalRecords),
  appointments: many(appointments),
  medications: many(medications),
  bloodPressureRecords: many(bloodPressureRecords),
  bloodSugarRecords: many(bloodSugarRecords),
  diseaseHistories: many(diseaseHistories),
  emergencyContacts: many(emergencyContacts),
  createdInvitations: many(invitations, { relationName: "createdInvitations" }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  createdBy: one(users, {
    fields: [invitations.createdById],
    references: [users.id],
    relationName: "createdInvitations"
  }),
}));