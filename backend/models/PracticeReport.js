import { Model } from 'objection';
import { randomUUID } from 'crypto';

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

  // relationMappings removed due to ES Module compatibility issues with Objection.js
  // Used manual joins in controller instead
}

export default PracticeReport;
