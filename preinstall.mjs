#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Remove lock files
const filesToRemove = ["package-lock.json", "yarn.lock"];
for (const file of filesToRemove) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`✓ Removed ${file}`);
  }
}

// Check that pnpm is being used
const userAgent = process.env.npm_config_user_agent || "";
if (!userAgent.startsWith("pnpm/")) {
  console.error("❌ Error: Use pnpm instead of npm or yarn");
  process.exit(1);
}

console.log("✓ Preinstall checks passed");
