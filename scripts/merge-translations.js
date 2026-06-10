#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const msgDir = path.join(__dirname, "../messages");
const enFile = path.join(msgDir, "en.json");

const en = JSON.parse(fs.readFileSync(enFile, "utf8"));

// Get all language files
const files = fs
  .readdirSync(msgDir)
  .filter((f) => f.endsWith(".json") && f !== "en.json");

files.forEach((file) => {
  const filePath = path.join(msgDir, file);
  const existing = JSON.parse(fs.readFileSync(filePath, "utf8"));

  // Deep merge: keep existing translations, add missing keys with English values
  const merged = deepMerge(existing, en);

  fs.writeFileSync(filePath, JSON.stringify(merged, null, 2) + "\n");
  console.log(`✓ ${file}`);
});

function deepMerge(obj1, obj2) {
  const result = { ...obj1 };

  for (const key in obj2) {
    if (typeof obj2[key] === "object" && obj2[key] !== null) {
      result[key] = deepMerge(
        result[key] || {},
        obj2[key]
      );
    } else if (!(key in result)) {
      result[key] = obj2[key];
    }
  }

  return result;
}
