import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
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

export const invitations = pgTable("invitations", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  role: text("role").$type<UserRole>().notNull(),
  token: text("token").unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  createdById: integer("created_by_id").notNull().references(() => users.id),
});

export const medicalRecords = pgTable("medical_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  birthDate: text("birth_date").notNull(),
  isDiabetic: boolean("is_diabetic").default(false),
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

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  department: text("department").notNull(),
  status: text("status").notNull().default('scheduled'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  dosage: text("dosage").notNull(),
  frequency: text("frequency").notNull(),
  duration: integer("duration"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  medicalRecords: many(medicalRecords),
  appointments: many(appointments),
  medications: many(medications),
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

// Schema for emergency contacts
export const insertEmergencyContactSchema = createInsertSchema(emergencyContacts);
export const selectEmergencyContactSchema = createSelectSchema(emergencyContacts);
export type InsertEmergencyContact = typeof emergencyContacts.$inferInsert;
export type SelectEmergencyContact = typeof emergencyContacts.$inferSelect;

// Schema for users
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

// Schema for invitations
export const insertInvitationSchema = createInsertSchema(invitations);
export const selectInvitationSchema = createSelectSchema(invitations);
export type InsertInvitation = typeof invitations.$inferInsert;
export type SelectInvitation = typeof invitations.$inferSelect;