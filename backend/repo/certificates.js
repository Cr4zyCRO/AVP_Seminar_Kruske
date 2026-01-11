import Certificate from "../models/Certificate.js";
import Application from '../models/Application.js';

class CertificateRepository {

    async getUserCertificates(userId) {
        const certificates = Certificate.query()
            .select('id', 'student_id', 'application_id', 'certificate_name', 'status')
            .where('student_id', userId);
        
        return certificates || null;
    }

    async getCertificates() {
        const certificates = Certificate.query()
            .select('id', 'student_id', 'application_id', 'certificate_name', 'status');

        return certificates || null;
    }

    async getProfessorCertificates(userId) {
        const students = Application.query()
            .where('faculty_mentor_id', userId)
            .select('student_id');

        const certificates = Certificate.query()
            .select('id', 'student_id', 'application_id', 'certificate_name', 'status')
            .whereIn('student_id', students);

        return certificates;
    }

    async getMentorCertificates(userId) {
            const students = Application.query()
            .where('company_mentor_id', userId)
            .select('student_id');

        const certificates = Certificate.query()
            .select('id', 'student_id', 'application_id', 'certificate_name', 'status')
            .whereIn('student_id', students);

        return certificates;
    }

    async getUserCertificate(certificateId) {

        return Certificate.query()
        .findById(certificateId)
        .first();
    }

    async insertNewUserCertificate(certificate) {
        return Certificate.query().insert(certificate);
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

    async getUserCertificateDetails(certificateId) {
        const certificates = Certificate.query()
            .findById(certificateId)
            .select('id', 'student_id', 'application_id', 'certificate_name', 'status')
            .first();
        
        return certificates || null;
    }

    async removeUserCertificate(certificateId) {
        return certificate = Certificate.query().deleteById(certificateId);
    }

    async getUsersApplicationId(userId) {
        return applicationId = Application.query().findById(userId).select('id').first();
    }

    async updateUserCertificateStatus(certificateId, status, mentorId) {

        const application_id = Application.query().where('faculty_mentor_id', mentorId).orWhere('company_mentor_id', mentorId).select('id');

        return certificate = Certificate.query().patch(
            { status: status }
        )
        .where('id', certificateId)
        .andWhere('application_id', application_id)
    };
}

export default new CertificateRepository();