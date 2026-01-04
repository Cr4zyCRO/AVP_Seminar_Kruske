import express from "express";
import Joi from "joi";
import CompanyRepo from "../repo/companies.js";
import { authorizeStudent, jwtCheck } from "../middleware/authMiddleware.js"; // Middleware za provjeru JWT-a
import { query, params } from "../middleware/validate.js";         // Middleware za Joi validaciju
import { base64ToPdfBuffer, getUserCertificate } from "../repo/certificates.js";

const router = express.Router();


router.get(
    "/", 
    jwtCheck, // provjera jwt tokena
    authorizeStudent, // provjera da samo student može pozvati ovaj endpoint
    async (req, res) => {
        try {
            
            const result = await getUserCertificates(req.user.id);
                            
            res.json({
                certificateId: result.id,
                name: result.certificate_name,
                status: result.status,
                studentId: result.student_id,
                applicationId: result.application_id
            });
        } catch (err) {
            console.error("Error fetching certificates:", err.message);
            res.status(500).json({ error: "Failed to fetch user certificates list" });
        }
    }
)


router.get(
    "/:certificateId",
    jwtCheck,
    async (req, res) => {

        const {certificateId} = req.params;

        if (certificateId === null)
        {
            console.error("Error fetching certificates:", err.message);
            res.status(500).json({ error: `CertificateId cannot be null` });
        }

        try {

        const certificate = await getUserCertificate(certificateId);

        if (certificate === null)
        {
            console.error("Error fetching certificates:", err.message);
            res.status(404).json({ error: `Certificate with id ${certificateId} not found` });
        }

        const pdfBuffer = base64ToPdfBuffer(certificate.content);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="${certificate.name ?? "file.pdf"}"`);
        res.setHeader("Content-Length", pdfBuffer.length);

        return res.end(pdfBuffer);
            
        } catch (error) {
            console.error("Error fetching certificates:", err.message);
            res.status(500).json({ error: `Failed to fetch certificate with id ${certificateId}` });
        }
    }
)

export default router;