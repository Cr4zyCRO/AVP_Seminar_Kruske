import { Model } from 'objection';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class User extends Model {
  static get tableName() {
    return 'user';
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
      required: ['email', 'jmbag', 'oib'],

      properties: {
        id: { type: 'string', format: 'uuid' },
        firstname: { type: 'string' },
        lastname: { type: 'string' },
        email: { type: 'string' },
        password: { type: 'string' },
        role: { type: 'string' },
        jmbag: { type: 'string' },
        oib: { type: 'string' },
      },
    };
  }

  static get relationMappings() {
    return {
      ownedCompanies: {
        relation: Model.HasManyRelation,
        modelClass: path.join(__dirname, 'Company.js'),
        join: {
          from: 'user.id',
          to: 'company.owner_id',
        },
      },

      studentApplications: {
        relation: Model.HasManyRelation,
        modelClass: path.join(__dirname, 'Application.js'),
        join: {
          from: 'user.id',
          to: 'application.student_id',
        },
      },

      companyMentorApplications: {
        relation: Model.HasManyRelation,
        modelClass: path.join(__dirname, 'Application.js'),
        join: {
          from: 'user.id',
          to: 'application.company_mentor_id',
        },
      },

      facultyMentorApplications: {
        relation: Model.HasManyRelation,
        modelClass: path.join(__dirname, 'Application.js'),
        join: {
          from: 'user.id',
          to: 'application.faculty_mentor_id',
        },
      },

      workDiaries: {
        relation: Model.HasManyRelation,
        modelClass: path.join(__dirname, 'WorkDiary.js'),
        join: {
          from: 'user.id',
          to: 'work_diary.student_id',
        },
      },

      practiceReports: {
        relation: Model.HasManyRelation,
        modelClass: path.join(__dirname, 'PracticeReport.js'),
        join: {
          from: 'user.id',
          to: 'practice_report.student_id',
        },
      },
    };
  }
}

export default User;
