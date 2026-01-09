import { Model } from 'objection';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Application extends Model {
  static get tableName() {
    return 'application';
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
      required: ['student_id', 'company_id'],

      properties: {
        id: { type: 'string', format: 'uuid' },
        student_id: { type: 'string', format: 'uuid' },
        company_id: { type: 'string', format: 'uuid' },
        company_mentor_id: { type: 'string', format: 'uuid' },
        faculty_mentor_id: { type: 'string', format: 'uuid' },
        uputnica_file: { type: 'string' },
        uptnica_status: { type: 'string' },
        status: { type: 'string' },
      },
    };
  }

  static get relationMappings() {
    return {
      student: {
        relation: Model.BelongsToOneRelation,
        modelClass: path.join(__dirname, 'User.js'),
        join: {
          from: 'application.student_id',
          to: 'user.id',
        },
      },

      company: {
        relation: Model.BelongsToOneRelation,
        modelClass: path.join(__dirname, 'Company.js'),
        join: {
          from: 'application.company_id',
          to: 'company.id',
        },
      },

      companyMentor: {
        relation: Model.BelongsToOneRelation,
        modelClass: path.join(__dirname, 'User.js'),
        join: {
          from: 'application.company_mentor_id',
          to: 'user.id',
        },
      },

      facultyMentor: {
        relation: Model.BelongsToOneRelation,
        modelClass: path.join(__dirname, 'User.js'),
        join: {
          from: 'application.faculty_mentor_id',
          to: 'user.id',
        },
      },

      certificates: {
        relation: Model.HasManyRelation,
        modelClass: path.join(__dirname, 'Certificate.js'),
        join: {
          from: 'application.id',
          to: 'certificate.application_id',
        },
      },

      workDiaries: {
        relation: Model.HasManyRelation,
        modelClass: path.join(__dirname, 'WorkDiary.js'),
        join: {
          from: 'application.id',
          to: 'work_diary.application_id',
        },
      },

      practiceReports: {
        relation: Model.HasManyRelation,
        modelClass: path.join(__dirname, 'PracticeReport.js'),
        join: {
          from: 'application.id',
          to: 'practice_report.application_id',
        },
      },
    };
  }
}

export default Application;
