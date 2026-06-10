/**
 * Encrypts a string (e.g. password) using browser-native Web Crypto API.
 * Uses RSA-OAEP with SHA-256. Matches Java backend's RSA/ECB/OAEPWithSHA-256AndMGF1Padding.
 */
export async function encryptPassword(plainText: string, publicKeyPem: string): Promise<string> {
  const pemHeader = "-----BEGIN PUBLIC KEY-----";
  const pemFooter = "-----END PUBLIC KEY-----";

  // 1. Clean the PEM string to extract the raw base64 body
  const rawBase64 = publicKeyPem
    .replace(pemHeader, "")
    .replace(pemFooter, "")
    .replace(/\s/g, "");

  // 2. Convert base64 string to a binary array buffer
  const binaryString = window.atob(rawBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const keyBuffer = bytes.buffer;

  // 3. Import the public key in SPKI format
  const publicKey = await window.crypto.subtle.importKey(
    "spki",
    keyBuffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    false,
    ["encrypt"]
  );

  // 4. Encrypt the plain text bytes
  const encoder = new TextEncoder();
  const textBuffer = encoder.encode(plainText);
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    publicKey,
    textBuffer
  );

  // 5. Convert the encrypted buffer to base64 for HTTP transmission
  const encryptedBytes = new Uint8Array(encryptedBuffer);
  let binary = "";
  const byteLength = encryptedBytes.byteLength;
  for (let i = 0; i < byteLength; i++) {
    binary += String.fromCharCode(encryptedBytes[i]);
  }
  return window.btoa(binary);
}
