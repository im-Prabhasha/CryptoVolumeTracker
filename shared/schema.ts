import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users schema from original template
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Crypto data schema
export const cryptoCoins = pgTable("crypto_coins", {
  id: serial("id").primaryKey(),
  coinId: text("coin_id").notNull().unique(),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  slug: text("slug").notNull(),
  latestData: jsonb("latest_data").notNull(),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const insertCryptoSchema = createInsertSchema(cryptoCoins).omit({
  id: true,
});

// Volume spikes schema
export const volumeSpikes = pgTable("volume_spikes", {
  id: serial("id").primaryKey(),
  coinId: text("coin_id").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  previousRatio: real("previous_ratio").notNull(),
  currentRatio: real("current_ratio").notNull(),
  percentageChange: real("percentage_change").notNull(),
  price: real("price").notNull(),
  marketCap: real("market_cap").notNull(),
  volume: real("volume").notNull(),
});

export const insertVolumeSpikeSchema = createInsertSchema(volumeSpikes).omit({
  id: true,
});

// Types based on schemas
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCrypto = z.infer<typeof insertCryptoSchema>;
export type CryptoCoin = typeof cryptoCoins.$inferSelect;

export type InsertVolumeSpike = z.infer<typeof insertVolumeSpikeSchema>;
export type VolumeSpike = typeof volumeSpikes.$inferSelect;
