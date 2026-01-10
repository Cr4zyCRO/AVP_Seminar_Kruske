import WorkDiary from '../models/WorkDiary.js';
import Application from '../models/Application.js';
import PDFDocument from 'pdfkit';

class WorkDiaryController {
    // 1. KREIRANJE: Student dodaje novi unos
    async createWorkDiaryEntry(req, res) {
        try {
            const { date, hours, taskDescription, application_id } = req.body;
            const studentId = req.user.id;

            const entry = await WorkDiary.query().insert({
                student_id: studentId,
                application_id,
                description: taskDescription,
                hours: hours,
                status: 'pending',
                is_created: date
            });

            return res.status(201).json({ message: 'Entry created successfully.', entry });
        } catch (error) {
            console.error('Error creating entry:', error);
            res.status(500).json({ message: 'Server error.' });
        }
    }

    // 2. AŽURIRANJE: Dozvoljeno samo vlasniku (studentu)
    async updateLogEntry(req, res) {
        try {
            const logId = req.params.id;
            const studentId = req.user.id;
            const { date, hours, taskDescription } = req.body;

            const entry = await WorkDiary.query().findById(logId);
            if (!entry) return res.status(404).json({ message: "Work-diary not found." });

            if (entry.student_id !== studentId) {
                return res.status(403).json({ message: "Forbidden: You are not the owner of this entry." });
            }

            const updatedEntry = await WorkDiary.query().patchAndFetchById(logId, {
                description: taskDescription,
                hours: hours,
                is_created: date
            });

            return res.status(200).json({ message: "Updated successfully.", entry: updatedEntry });
        } catch (err) {
            res.status(500).json({ message: "Server error." });
        }
    }

    // 3. DOHVAT SVIH: Za studenta (Sortirano: najnovije -> najstarije)
    async getAllLogEntries(req, res) {
        try {
            const entries = await WorkDiary.query()
                .where('student_id', req.user.id)
                .orderBy('is_created', 'desc');
            res.json(entries);
        } catch (err) {
            res.status(500).json({ message: "Error fetching entries." });
        }
    }

    // 4. FILTRIRANJE: Dohvat unosa unutar datumskog ranga
    async getFilteredLogEntries(req, res) {
        try {
            const { from, to } = req.query;
            const entries = await WorkDiary.query()
                .where('student_id', req.user.id)
                .whereBetween('is_created', [from, to])
                .orderBy('is_created', 'asc');
            
            res.json(entries);
        } catch (err) {
            res.status(500).json({ message: "Filter error." });
        }
    }

    // 5. BRISANJE: Dozvoljeno samo vlasniku
    async deleteLogEntry(req, res) {
        try {
            const entry = await WorkDiary.query().findById(req.params.id);
            if (!entry || entry.student_id !== req.user.id) {
                return res.status(403).json({ message: "Unauthorized deletion." });
            }
            await WorkDiary.query().deleteById(req.params.id);
            res.json({ message: "Entry deleted successfully." });
        } catch (err) {
            res.status(500).json({ message: "Delete error." });
        }
    }

    // 6. MENTOR ACCESS: Samo za studente koji su mu dodijeljeni
    async getStudentLogForMentor(req, res) {
        try {
            const { studentId } = req.params;
            const mentorId = req.user.id;

            const assignment = await Application.query()
                .where({ student_id: studentId, company_mentor_id: mentorId })
                .first();

            if (!assignment) return res.status(403).json({ message: "Access denied: Student not assigned to you." });

            const logs = await WorkDiary.query()
                .where('student_id', studentId)
                .orderBy('is_created', 'desc');
            
            res.json(logs);
        } catch (err) {
            res.status(500).json({ message: "Mentor view error." });
        }
    }

    // 7. FACULTY ACCESS (Task 8): Read-only pristup bilo kojem studentu
    async getStudentLogForFaculty(req, res) {
        try {
            const { studentId } = req.params;
            const facultyId = req.user.id;

            // Log faculty access for auditing purposes
            console.log(`AUDIT: Faculty member ${facultyId} accessed logs for student ${studentId} at ${new Date().toISOString()}`);

            const logs = await WorkDiary.query()
                .where('student_id', studentId)
                .orderBy('is_created', 'desc');
            
            // Računanje ukupnih sati za faculty pregled
            const totalHours = logs.reduce((sum, e) => sum + parseFloat(e.hours || 0), 0);

            res.json({
                studentId,
                totalHours,
                entries: logs // Data is read-only by nature of the GET endpoint
            });
        } catch (err) {
            res.status(500).json({ message: "Faculty access error." });
        }
    }

    // 8. PDF EXPORT: Generiranje i slanje PDF-a
    async exportLogToPDF(req, res) {
        try {
            const studentId = req.user.id;
            const entries = await WorkDiary.query()
                .where('student_id', studentId)
                .orderBy('is_created', 'asc');

            const doc = new PDFDocument({ margin: 50 });
            let buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);

                // Zaglavlja za slanje PDF-a
                res.setHeader("Content-Type", "application/pdf");
                res.setHeader("Content-Disposition", `attachment; filename="Dnevnik_prakse_${studentId}.pdf"`);
                res.setHeader("Content-Length", pdfBuffer.length);
                return res.end(pdfBuffer);
            });

            // Dizajn PDF-a
            doc.fontSize(20).text('IZVJEŠTAJ DNEVNIKA STRUČNE PRAKSE', { align: 'center' });
            doc.moveDown();
            doc.fontSize(10).text(`Generirano: ${new Date().toLocaleString()}`, { align: 'right' });
            doc.moveDown();

            let totalHours = 0;
            entries.forEach((e, i) => {
                totalHours += parseFloat(e.hours || 0);
                doc.fontSize(12).fillColor('black').text(`${i + 1}. DATUM: ${new Date(e.is_created).toLocaleDateString()}`);
                doc.fontSize(11).text(`Sati: ${e.hours}h`);
                doc.text(`Zadatak: ${e.description}`);
                doc.text(`Status: ${e.status}`);
                doc.moveDown(0.5);
                doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#cccccc').stroke();
                doc.moveDown(0.5);
            });

            doc.moveDown().fontSize(14).bold().text(`UKUPNO ODRAĐENO SATI: ${totalHours}h`, { align: 'right' });
            doc.end();

        } catch (err) {
            console.error('PDF Error:', err);
            res.status(500).json({ error: "Failed to generate PDF report" });
        }
    }
}

export default new WorkDiaryController();