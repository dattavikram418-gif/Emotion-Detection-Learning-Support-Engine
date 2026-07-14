/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from "fs";
import * as path from "path";
import { User, EmotionRecord } from "../types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const EXAMPLES_CSV = path.join(DATA_DIR, "emotion_response_examples.csv");
const MAPPING_CSV = path.join(DATA_DIR, "emotion_response_mapping.csv");

// Simple JSON structure
interface DatabaseSchema {
  users: Record<string, User & { passwordHash: string }>;
  records: EmotionRecord[];
}

// Ensure database directory and files exist
function initDB() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initial: DatabaseSchema = {
      users: {
        // Seed some admin/student accounts for convenient testing
        "student@example.com": {
          email: "student@example.com",
          name: "Alex Learner",
          role: "student",
          loginCount: 1,
          createdAt: new Date().toISOString(),
          passwordHash: "password123" // keeping it simple for testing
        },
        "educator@example.com": {
          email: "educator@example.com",
          name: "Professor Smith",
          role: "educator",
          loginCount: 1,
          createdAt: new Date().toISOString(),
          passwordHash: "password123"
        }
      },
      records: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf8");
  }

  // Ensure CSV files have headers if empty
  if (!fs.existsSync(EXAMPLES_CSV)) {
    const header = "text,emotion,confidence,response,field,timestamp\n";
    fs.writeFileSync(EXAMPLES_CSV, header, "utf8");
  }

  if (!fs.existsSync(MAPPING_CSV)) {
    const header = "emotion,response_type,response,field\n";
    fs.writeFileSync(MAPPING_CSV, header, "utf8");
  }
}

// Read DB file
function readDB(): DatabaseSchema {
  initDB();
  try {
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file, returning empty schema", err);
    return { users: {}, records: [] };
  }
}

// Write DB file
function writeDB(db: DatabaseSchema) {
  initDB();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
}

// Escape values for CSV
function escapeCSV(val: any): string {
  if (val === undefined || val === null) return "";
  let str = String(val);
  // Replace double quotes with two double quotes
  str = str.replace(/"/g, '""');
  // If has comma, double quote or newline, wrap in double quotes
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str}"`;
  }
  return str;
}

// Append record to CSV logs
export function logInteractionToCSV(record: EmotionRecord) {
  try {
    initDB();

    // 1. Log to emotion_response_examples.csv
    const exampleRow = [
      escapeCSV(record.inputText),
      escapeCSV(record.predictedEmotion),
      escapeCSV(record.confidenceScore),
      escapeCSV(record.aiResponse),
      escapeCSV(record.field),
      escapeCSV(record.timestamp)
    ].join(",") + "\n";

    fs.appendFileSync(EXAMPLES_CSV, exampleRow, "utf8");

    // 2. Log to emotion_response_mapping.csv
    const mappingRow = [
      escapeCSV(record.predictedEmotion),
      escapeCSV(record.responseType),
      escapeCSV(record.aiResponse),
      escapeCSV(record.field)
    ].join(",") + "\n";

    fs.appendFileSync(MAPPING_CSV, mappingRow, "utf8");
  } catch (err) {
    console.error("Error writing to CSV logs", err);
  }
}

// Exported DB Operations
export const dbOps = {
  getUser(email: string): User | null {
    const db = readDB();
    const user = db.users[email.toLowerCase()];
    if (!user) return null;
    const { passwordHash, ...userClean } = user;
    return userClean;
  },

  registerUser(email: string, name: string, role: string, passwordHash: string): User {
    const db = readDB();
    const cleanEmail = email.toLowerCase();
    
    if (db.users[cleanEmail]) {
      throw new Error("User with this email already exists");
    }

    const newUser = {
      email: cleanEmail,
      name,
      role: role as any,
      loginCount: 1,
      createdAt: new Date().toISOString(),
      passwordHash
    };

    db.users[cleanEmail] = newUser;
    writeDB(db);

    const { passwordHash: _, ...cleanUser } = newUser;
    return cleanUser;
  },

  loginUser(email: string, passwordHash: string): User {
    const db = readDB();
    const cleanEmail = email.toLowerCase();
    const user = db.users[cleanEmail];

    if (!user || user.passwordHash !== passwordHash) {
      throw new Error("Invalid email or password");
    }

    user.loginCount += 1;
    writeDB(db);

    const { passwordHash: _, ...cleanUser } = user;
    return cleanUser;
  },

  saveRecord(record: EmotionRecord): EmotionRecord {
    const db = readDB();
    db.records.push(record);
    writeDB(db);

    // Write to CSV files as well
    logInteractionToCSV(record);
    
    return record;
  },

  getRecords(email: string): EmotionRecord[] {
    const db = readDB();
    const cleanEmail = email.toLowerCase();
    return db.records.filter(r => r.email === cleanEmail);
  },

  getAllRecords(): EmotionRecord[] {
    const db = readDB();
    return db.records;
  },

  clearRecords(email: string) {
    const db = readDB();
    const cleanEmail = email.toLowerCase();
    db.records = db.records.filter(r => r.email !== cleanEmail);
    writeDB(db);
  },

  getCSVStats() {
    initDB();
    try {
      if (fs.existsSync(EXAMPLES_CSV)) {
        const content = fs.readFileSync(EXAMPLES_CSV, "utf8");
        const lines = content.split("\n").filter(l => l.trim().length > 0);
        // exclude header
        return { count: Math.max(0, lines.length - 1) };
      }
    } catch {
      // ignore
    }
    return { count: 0 };
  }
};
