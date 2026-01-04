import CertificateRepository from "../repo/certificates.js"

class CertificatesController{

    async getCertificates(req, res) {
        try {
                    
            const result = await CertificateRepository.getUserCertificate(req.user.id);
                            
            res.json({
                certificateId: result.id,
                name: result.certificate_name,
                status: result.status,
                studentId: result.student_id,
                applicationId: result.application_id
            });
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
            console.error("Error fetching certificates:", err.message);
            res.status(500).json({ error: `Failed to fetch certificate with id ${id}` });
        }
    }
}



export default new CertificatesController();