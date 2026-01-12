import WorkDiary from '../models/WorkDiary.js';
import Application from '../models/Application.js';
import PDFDocument from 'pdfkit';

class WorkDiaryController {
    // 1. KREIRANJE: Student dodaje novi unos
    async createWorkDiaryEntry(req, res) {
        try {
            const { date, hours, taskDescription, application_id } = req.body;
            const studentId = req.user.id;

            const contentData = JSON.stringify({
                date,
                hours,
                taskDescription
            });

            const entry = await WorkDiary.query().insert({
                student_id: studentId,
                application_id,
                content: contentData,
                status: 'pending'
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

            const contentData = JSON.stringify({
                date,
                hours,
                taskDescription
            });

            const updatedEntry = await WorkDiary.query().patchAndFetchById(logId, {
                content: contentData,
                is_updated: new Date().toISOString()
            });

            return res.status(200).json({ message: "Updated successfully.", entry: updatedEntry });
        } catch (err) {
            console.error('Error updating entry:', err);
            res.status(500).json({ message: "Server error." });
        }
    }

    // 3. DOHVAT SVIH: Za studenta (Sortirano: najnovije -> najstarije)
    async getAllLogEntries(req, res) {
        try {
            const entries = await WorkDiary.query()
                .where('student_id', req.user.id)
                .orderBy('is_created', 'desc');
            
            const formattedEntries = entries.map(entry => {
                let parsed = {};
                try {
                    parsed = JSON.parse(entry.content);
                } catch (e) {
                    parsed = { taskDescription: entry.content };
                }
                return {
                    id: entry.id,
                    date: parsed.date || entry.is_created,
                    hours: parsed.hours || 0,
                    taskDescription: parsed.taskDescription || '',
                    status: entry.status,
                    application_id: entry.application_id,
                    is_created: entry.is_created
                };
            });
            
            res.json(formattedEntries);
        } catch (err) {
            console.error('Error fetching entries:', err);
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
            
            const formattedEntries = entries.map(entry => {
                let parsed = {};
                try {
                    parsed = JSON.parse(entry.content);
                } catch (e) {
                    parsed = { taskDescription: entry.content };
                }
                return {
                    id: entry.id,
                    date: parsed.date || entry.is_created,
                    hours: parsed.hours || 0,
                    taskDescription: parsed.taskDescription || '',
                    status: entry.status,
                    application_id: entry.application_id,
                    is_created: entry.is_created
                };
            });
            
            res.json(formattedEntries);
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
            
            const formattedLogs = logs.map(entry => {
                let parsed = {};
                try {
                    parsed = JSON.parse(entry.content);
                } catch (e) {
                    parsed = { taskDescription: entry.content };
                }
                return {
                    id: entry.id,
                    date: parsed.date || entry.is_created,
                    hours: parsed.hours || 0,
                    taskDescription: parsed.taskDescription || '',
                    status: entry.status,
                    application_id: entry.application_id,
                    is_created: entry.is_created
                };
            });
            
            res.json(formattedLogs);
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
            
            let totalHours = 0;
            const formattedLogs = logs.map(entry => {
                let parsed = {};
                try {
                    parsed = JSON.parse(entry.content);
                } catch (e) {
                    parsed = { taskDescription: entry.content };
                }
                totalHours += parseFloat(parsed.hours || 0);
                return {
                    id: entry.id,
                    date: parsed.date || entry.is_created,
                    hours: parsed.hours || 0,
                    taskDescription: parsed.taskDescription || '',
                    status: entry.status,
                    is_created: entry.is_created
                };
            });

            res.json({
                studentId,
                totalHours,
                entries: formattedLogs
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

                res.setHeader("Content-Type", "application/pdf");
                res.setHeader("Content-Disposition", `attachment; filename="Work_Diary_${new Date().toISOString().split('T')[0]}.pdf"`);
                res.setHeader("Content-Length", pdfBuffer.length);
                return res.end(pdfBuffer);
            });

            doc.fontSize(22).fillColor('#1f2d3d').text('INTERNSHIP WORK DIARY', { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(10).fillColor('#6c757d').text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'center' });
            doc.moveDown(1.5);

            let totalHours = 0;
            entries.forEach(e => {
                try {
                    const parsed = JSON.parse(e.content);
                    totalHours += parseFloat(parsed.hours || 0);
                } catch (err) {}
            });

            doc.rect(50, doc.y, 512, 40).fill('#f8f9fa');
            doc.fillColor('#1f2d3d').fontSize(12).text(`Total Entries: ${entries.length}`, 70, doc.y - 30);
            doc.text(`Total Hours: ${totalHours.toFixed(1)}h`, 300, doc.y - 12);
            doc.moveDown(2);

            if (entries.length === 0) {
                doc.moveDown(2);
                doc.fontSize(14).fillColor('#6c757d').text('No work diary entries found.', { align: 'center' });
            } else {
                const tableTop = doc.y + 10;
                doc.rect(50, tableTop, 512, 25).fill('#3c6e71');
                doc.fillColor('#ffffff').fontSize(11);
                doc.text('#', 60, tableTop + 7, { width: 30 });
                doc.text('Date', 95, tableTop + 7, { width: 80 });
                doc.text('Hours', 180, tableTop + 7, { width: 50 });
                doc.text('Task Description', 240, tableTop + 7, { width: 280 });
                doc.text('Status', 520, tableTop + 7, { width: 60 });
                
                let yPos = tableTop + 25;

                entries.forEach((e, i) => {
                    let parsed = {};
                    try {
                        parsed = JSON.parse(e.content);
                    } catch (err) {
                        parsed = { taskDescription: e.content || '' };
                    }

                    const rowHeight = 30;
                    
                    if (i % 2 === 0) {
                        doc.rect(50, yPos, 512, rowHeight).fill('#ffffff');
                    } else {
                        doc.rect(50, yPos, 512, rowHeight).fill('#f8f9fa');
                    }

                    doc.fillColor('#1f2d3d').fontSize(10);
                    doc.text(`${i + 1}`, 60, yPos + 10, { width: 30 });
                    doc.text(new Date(parsed.date || e.is_created).toLocaleDateString('en-US'), 95, yPos + 10, { width: 80 });
                    doc.text(`${parsed.hours || 0}h`, 180, yPos + 10, { width: 50 });
                    
                    const desc = (parsed.taskDescription || '').substring(0, 50);
                    doc.text(desc + (parsed.taskDescription?.length > 50 ? '...' : ''), 240, yPos + 10, { width: 270 });
                    
                    const status = e.status || 'pending';
                    if (status === 'approved') {
                        doc.fillColor('#155724');
                    } else if (status === 'rejected') {
                        doc.fillColor('#721c24');
                    } else {
                        doc.fillColor('#856404');
                    }
                    doc.text(status.charAt(0).toUpperCase() + status.slice(1), 510, yPos + 10, { width: 60 });

                    yPos += rowHeight;

                    if (yPos > 700) {
                        doc.addPage();
                        yPos = 50;
                    }
                });

                doc.moveTo(50, yPos).lineTo(562, yPos).strokeColor('#e9ecef').stroke();
            }

            doc.moveDown(3);
            doc.fontSize(9).fillColor('#adb5bd').text('This document was automatically generated by the Internship Management System.', { align: 'center' });

            doc.end();

        } catch (err) {
            console.error('PDF Error:', err);
            res.status(500).json({ error: "Failed to generate PDF report" });
        }
    }
}

export default new WorkDiaryController();