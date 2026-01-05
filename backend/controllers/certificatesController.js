import CertificateRepository from "../repo/certificates.js"

class CertificatesController{

    async getCertificates(req, res) {
        try {
            const result = await CertificateRepository.getUserCertificates(req.user.id);
            
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

            const newCertificate = await CertificateRepository.insertNewUserCertificate({
                status: "Unapproved",
                application_id: "73ec06a8-c6af-4202-a096-4c33ba8f079d", // TODO: exchange this with proper application id
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
}

export default new CertificatesController();