// db/schema.ts
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const searches = pgTable("searches", {
  id: serial("id").primaryKey(),
  query: text("query").notNull().unique(), // Unique so we don't store "Two Sum" twice
  response: text("response").notNull(),    // The Markdown explanation
  createdAt: timestamp("created_at").defaultNow(),
});