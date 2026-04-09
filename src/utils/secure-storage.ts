/**
 * Secure storage utility for client-side token encryption
 * Uses Web Crypto API to encrypt sensitive data before storing in localStorage
 */

import { debug } from "@/utils/debug";

const STORAGE_KEY_PREFIX = "secure_";
const ALGORITHM = "AES-GCM";

// Decrypt data
async function decryptData(encryptedData: string): Promise<string> {
  try {
    const decoder = new TextDecoder();
    const password = await getBrowserFingerprint();

    // Convert from base64
    const combined = new Uint8Array(
      atob(encryptedData)
        .split("")
        .map((char) => char.charCodeAt(0)),
    );

    // Extract salt, iv, and encrypted data
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encrypted = combined.slice(28);

    const key = await deriveKey(password, salt);
    const decrypted = await crypto.subtle.decrypt(
      { iv, name: ALGORITHM },
      key,
      encrypted,
    );

    return decoder.decode(decrypted);
  } catch (error) {
    debug.error("Decryption failed:", error);
    throw new Error("Failed to decrypt data");
  }
}

// Generate a key from a password using PBKDF2
async function deriveKey(
  password: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      hash: "SHA-256",
      iterations: 100000,
      name: "PBKDF2",
      salt: salt as BufferSource,
    },
    keyMaterial,
    { length: 256, name: ALGORITHM },
    false,
    ["encrypt", "decrypt"],
  );
}

// Encrypt data
async function encryptData(data: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const password = await getBrowserFingerprint();
    const salt = generateSalt();
    const iv = generateIV();

    const key = await deriveKey(password, salt);
    const encrypted = await crypto.subtle.encrypt(
      { iv: iv as BufferSource, name: ALGORITHM },
      key,
      encoder.encode(data),
    );

    // Combine salt, iv, and encrypted data
    const combined = new Uint8Array(
      salt.length + iv.length + encrypted.byteLength,
    );
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);

    // Convert to base64 for storage
    return btoa(String.fromCharCode.apply(null, Array.from(combined)));
  } catch (error) {
    debug.error("Encryption failed:", error);
    throw new Error("Failed to encrypt data");
  }
}

// Generate a random IV
function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12));
}

// Generate a random salt
function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

// Get a deterministic password based on the browser/device.
// Deliberately excludes navigator.userAgent — it contains the browser
// version string which changes on every auto-update, silently
// invalidating all encrypted tokens.
// Deliberately excludes screen.width/height — these change when monitors
// are connected/disconnected.
async function getBrowserFingerprint(): Promise<string> {
  const fingerprint = [
    navigator.language,
    navigator.hardwareConcurrency,
    navigator.platform, // deprecated but stable across all browsers
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ].join("|");

  // Hash the fingerprint to create a more uniform key
  const encoder = new TextEncoder();
  const data = encoder.encode(fingerprint);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Check if Web Crypto API is available and we're not in a test environment
function isWebCryptoAvailable(): boolean {
  // In test environments, fall back to plain storage for simplicity
  if (import.meta.env.MODE === "test") {
    return false;
  }

  // E2E tests set this flag via addInitScript to bypass encryption
  if (
    typeof window !== "undefined" &&
    (window as unknown as Record<string, unknown>).__E2E_PLAIN_STORAGE__ ===
      true
  ) {
    return false;
  }

  return (
    typeof crypto?.subtle !== "undefined" &&
    typeof crypto.getRandomValues !== "undefined"
  );
}

export const secureStorage = {
  /**
   * Retrieve and decrypt data from localStorage
   */
  async getItem(key: string): Promise<null | string> {
    const stored = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (!stored) return null;

    if (!isWebCryptoAvailable()) {
      return stored;
    }

    try {
      return await decryptData(stored);
    } catch {
      // Decryption failed — fingerprint changed or data corrupted.
      // Clear the key rather than returning raw ciphertext.
      localStorage.removeItem(STORAGE_KEY_PREFIX + key);
      return null;
    }
  },

  /**
   * Check if an item exists
   */
  hasItem(key: string): boolean {
    return localStorage.getItem(STORAGE_KEY_PREFIX + key) !== null;
  },

  /**
   * Remove item from localStorage
   */
  removeItem(key: string): void {
    localStorage.removeItem(STORAGE_KEY_PREFIX + key);
  },

  /**
   * Store encrypted data in localStorage
   */
  async setItem(key: string, value: string): Promise<void> {
    if (!isWebCryptoAvailable()) {
      debug.warn("Web Crypto API not available, falling back to plain storage");
      localStorage.setItem(STORAGE_KEY_PREFIX + key, value);
      return;
    }

    const encrypted = await encryptData(value);
    localStorage.setItem(STORAGE_KEY_PREFIX + key, encrypted);
  },
};
