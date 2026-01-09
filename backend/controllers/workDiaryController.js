const WorkDiary = require('../models/WorkDiary');

exports.createWorkDiaryEntry = async (req, res) => {
  try {
    const { date, hours, taskDescription, application_id } = req.body;

    // Validate required fields
    if (!date || !hours || !taskDescription || !application_id) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Student ID dolazi iz auth middlewarea
    const studentId = req.user.id;

    // Create entry
    const entry = await WorkDiary.query().insert({
      student_id: studentId,
      application_id,
      content: JSON.stringify({
        date,
        hours,
        task: taskDescription
      }),
      status: 'draft' 
    });

    return res.status(201).json({
      message: 'Work diary entry created successfully.',
      entry
    });

  } catch (error) {
    console.error('Error creating work diary entry:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};



exports.updateLogEntry = async (req, res) => {
    try {
        const logId = req.params.id;
        const studentId = req.user.id; // dolazi iz JWT auth middleware-a

        const { date, hours, taskDescription } = req.body;

        // Basic validation
        if (!date || !hours || !taskDescription) {
            return res.status(400).json({
                message: "Date, hours and taskDescription are required."
            });
        }

        // 1. Check if entry exists
        const entry = await WorkDiary.query().findById(logId);

        if (!entry) {
            return res.status(404).json({ message: "Work-diary not found." });
        }

        // 2. Check ownership
        if (entry.student_id !== studentId) {
            return res.status(403).json({
                message: "You are not allowed to edit this work-diary."
            });
        }

        // 3. Update entry
        const updatedEntry = await WorkDiary.query()
            .patchAndFetchById(logId, {
                date: date,
                hours: hours,
                content: taskDescription
            });

        return res.status(200).json({
            message: "Work diary updated successfully.",
            entry: updatedEntry
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
};
