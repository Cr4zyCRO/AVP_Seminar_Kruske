import { Model } from 'objection';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PracticeReport extends Model {
  static get tableName() {
    return 'practice_report';
  }

  static get idColumn() {
    return 'id';
  }

  $beforeInsert() {
    if (!this.id) {
      this.id = randomUUID();
    }
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['student_id', 'application_id'],

      properties: {
        id: { type: 'string', format: 'uuid' },
        application_id: { type: 'string', format: 'uuid' },
        student_id: { type: 'string', format: 'uuid' },
        faculty_mentor_id: { type: 'string', format: 'uuid' },
        report_file: { type: 'string' },
        report_status: { type: 'string' },
        final_grade: { type: 'string' },
      },
    };
  }

  static get relationMappings() {
    return {
      application: {
        relation: Model.BelongsToOneRelation,
        modelClass: path.join(__dirname, 'Application.js'),
        join: {
          from: 'practice_report.application_id',
          to: 'application.id',
        },
      },

      student: {
        relation: Model.BelongsToOneRelation,
        modelClass: path.join(__dirname, 'User.js'),
        join: {
          from: 'practice_report.student_id',
          to: 'user.id',
        },
      },

      facultyMentor: {
        relation: Model.BelongsToOneRelation,
        modelClass: path.join(__dirname, 'User.js'),
        join: {
          from: 'practice_report.faculty_mentor_id',
          to: 'user.id',
        },
      },
    };
  }
}

export default PracticeReport;
