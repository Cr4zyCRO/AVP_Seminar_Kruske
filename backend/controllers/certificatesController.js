import CertificateRepository from "../repo/certificates.js"
import UserRepository from "../repo/users.js"

class CertificatesController{

    async getCertificates(req, res) {
        try {
            const user = await UserRepository.getUserById(req.user.id);
            let result;

            if (user.role === "student") {
                result = await CertificateRepository.getUserCertificates(req.user.id);
            }
            else if (user.role === "admin") {
                result = await CertificateRepository.getCertificates();
            }
            else if (user.role === "mentor") {
                result = await CertificateRepository.getMentorCertificates(req.user.id);
            }
            else if (user.role === "professor") {
                result = await CertificateRepository.getProfessorCertificates(req.user.id);
            }

            res.json(result);
        } 
        catch (err) {
            console.error("Error fetching certificates:", err.message);
            res.status(500).json({ error: "Failed to fetch user certificates list" });
        }
    }

    async getCertificateContent(req, res) {

        const {id} = req.params;
        try {

            const certificate = await CertificateRepository.getUserCertificate(id);

            if (certificate === null)
            {
                console.error("Error fetching certificates");
                res.status(404).json({ error: `Certificate with id ${id} not found` });
            }
            const pdfBuffer = CertificateRepository.base64ToPdfBuffer(certificate.content);

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `inline; filename="${certificate.name ?? "file.pdf"}"`);
            res.setHeader("Content-Length", pdfBuffer.length);

            return res.end(pdfBuffer);
            
        } 
        catch (err) {
            console.error("Error fetching certificate:", err.message);
            res.status(500).json({ error: `Failed to fetch certificate with id ${id}` });
        }
    }

    async insertNewUserCertificate(req, res) {
        try {
            if (!req.file) return res.status(400).json({ error: "Missing file field 'file'" });

            const { originalname, mimetype, size, buffer } = req.file;
            const base64 = buffer.toString("base64");

            const application_id = await CertificateRepository.getUsersApplicationId(req.user.id);

            const newCertificate = await CertificateRepository.insertNewUserCertificate({
                status: "Unapproved",
                application_id,
                student_id: req.user.id,
                content: base64,
                certificate_name: originalname
            });
            res.status(201).json(newCertificate);

        } catch (err) {
            console.error("Error inserting new certificates:", err.message);
            res.status(500).json({ error: `Failed to insert new certificate` });
        }
    }

    async removeUserCertificate(req, res) {
        const {id} = req.params;
        try {

            const certificate = await CertificateRepository.getUserCertificateDetails(id);

            if(certificate.student_id !== req.user.id) {
                console.error("Cannot remove certificate that is not users");
                res.status(404).json({ error: `Certificate with id ${id} cannot be removed because it is not logged in users certificate` });
            }

            const removedCertificate = await CertificateRepository.removeUserCertificate(id);

            if (removedCertificate === 0)
            {
                console.error("Certificate not found");
                res.status(404).json({ error: `Certificate with id ${id} not found` });
            }

            res.status(204);

        } catch (err) {
            console.error("Error removing user certificate:", err.message);
            res.status(500).json({ error: `Failed to remove user certificate` });
        }
    }

    async updateUserCertificateStatus(req, res) {
        const {id, status} = req.body;
        try {
            const allowedStatuses = ["unapproved", "approved", "rejected"]

            if (!allowedStatuses.includes(status.toString().toLowerCase())) {
                console.error("Status request is not allowed");
                res.status(400).json({ error: `Entered status is not valid status` });
            }

            const updatedCertificate = await CertificateRepository.updateUserCertificateStatus(id, status);
            if (updatedCertificate === 0) {
                console.error("Certificate status not updatead");
                res.status(400).json({ error: `Certificate status is not updatead` });
            }

            const certificate = await CertificateRepository.getUserCertificateDetails(id);
            res.status(200).json(certificate);

        } catch (err) {
            console.error("Error updating user certificate:", err.message);
            res.status(500).json({ error: `Failed to update user certificate` });
        }
    }
}

export default new CertificatesController();