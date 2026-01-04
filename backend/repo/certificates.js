import Certificate from "../models/Certificate.js";


class CertificateRepository {

    async getUserCertificates(userId) {
        const certificates = Certificate.query()
            .select('id, student_id, application_id, certificate_name, status')
            .where('student_id', userId);
        
        return certificates || null;
    }

    async getUserCertificate(certificateId) {

        return Certificate.query()
        .findById(certificateId)
        .first();
    }

    base64ToPdfBuffer(base64String) {
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
}

export default CertificateRepository