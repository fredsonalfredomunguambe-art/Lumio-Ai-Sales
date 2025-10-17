import crypto from "crypto";

const algorithm = "aes-256-gcm";
const secretKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
const keyLength = 32;

// Ensure secret key is the correct length
const key = crypto.scryptSync(secretKey.toString(), "salt", keyLength);

export interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
}

/**
 * Encrypts sensitive data using AES-256-GCM
 * @param data - Data to encrypt (will be JSON stringified)
 * @returns Encrypted data with IV and auth tag
 */
export function encryptCredentials(data: any): string {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipherGCM(algorithm, key, iv);

    const jsonData = JSON.stringify(data);
    let encrypted = cipher.update(jsonData, "utf8", "hex");
    encrypted += cipher.final("hex");

    const tag = cipher.getAuthTag();

    const result: EncryptedData = {
      encrypted,
      iv: iv.toString("hex"),
      tag: tag.toString("hex"),
    };

    return JSON.stringify(result);
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt credentials");
  }
}

/**
 * Decrypts sensitive data using AES-256-GCM
 * @param encryptedData - Encrypted data string
 * @returns Decrypted data object
 */
export function decryptCredentials(encryptedData: string): any {
  try {
    const data: EncryptedData = JSON.parse(encryptedData);

    const iv = Buffer.from(data.iv, "hex");
    const tag = Buffer.from(data.tag, "hex");
    const decipher = crypto.createDecipherGCM(algorithm, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(data.encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return JSON.parse(decrypted);
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt credentials");
  }
}

/**
 * Hash sensitive data for comparison (one-way)
 * @param data - Data to hash
 * @returns Hashed string
 */
export function hashCredentials(data: any): string {
  const jsonData = JSON.stringify(data);
  return crypto.createHash("sha256").update(jsonData).digest("hex");
}

/**
 * Generate a secure random token
 * @param length - Token length in bytes
 * @returns Random hex string
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Verify if credentials are properly encrypted
 * @param encryptedData - Data to verify
 * @returns Boolean indicating if data is encrypted
 */
export function isEncrypted(encryptedData: string): boolean {
  try {
    const data = JSON.parse(encryptedData);
    return data.encrypted && data.iv && data.tag;
  } catch {
    return false;
  }
}

