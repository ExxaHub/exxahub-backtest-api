import { readFileSync, writeFileSync } from "fs";
import { randomBytes } from "crypto";

const envFilePath = ".env";
const envContent = readFileSync(envFilePath, "utf-8");

// Parse current environment variables
const envVars = Object.fromEntries(
  envContent.split("\n").map((line) => {
    const [key, value] = line.split("=");
    return [key.trim(), value?.trim() || ""];
  })
);

// Check if DB_PASS is empty
if (!envVars["DB_PASS"]) {
  // Generate a random password
  const newPassword = randomBytes(24).toString("base64");

  // Update the .env content
  const updatedEnvContent = envContent
    .split("\n")
    .map((line) => {
      if (line.startsWith("DB_PASS=")) {
        return `DB_PASS=${newPassword}`;
      }
      return line;
    })
    .join("\n");

  // Write updated content back to .env
  writeFileSync(envFilePath, updatedEnvContent, "utf-8");

  console.log('Generated password for DB_PASS .env variable');
} else {
  console.log("DB_PASS .env variable already set.");
}
