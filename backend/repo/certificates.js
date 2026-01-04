import db from "../DB_config/knex.js";

export async function getUserCertificates(userId) {
    const certificates = await db('certificates')
        .where('student_id', userId)
        .first();

    return certificates || null;
}

export async function getUserCertificate(certificateId) {
    const certificate = await db('certificates')
    .where('id', certificateId)
    .first();

    return certificate || null;
}

export function base64ToPdfBuffer(base64String) {
  if (!base64String) throw new Error("Missing base64 content");

  const cleaned = base64String.includes("base64,")
    ? base64String.split("base64,")[1]
    : base64String;

  const buf = Buffer.from(cleaned, "base64");
  if (buf.length < 4 || buf.toString("utf8", 0, 4) !== "%PDF") {
    throw new Error("Decoded content does not look like a PDF");
  }

  return buf;
}