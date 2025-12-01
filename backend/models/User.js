const { Model } = require('objection');

class User extends Model {
  static get tableName() {
    return 'user';
  }

  static get idColumn() {
    return 'id';
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
    const Company = require('./Company');
    const Application = require('./Application');
    const WorkDiary = require('./WorkDiary');
    const PracticeReport = require('./PracticeReport');
    const Certificate = require('./Certificate');

    return {
      ownedCompanies: {
        relation: Model.HasManyRelation,
        modelClass: Company,
        join: {
          from: 'user.id',
          to: 'company.owner_id',
        },
      },

      studentApplications: {
        relation: Model.HasManyRelation,
        modelClass: Application,
        join: {
          from: 'user.id',
          to: 'application.student_id',
        },
      },

      companyMentorApplications: {
        relation: Model.HasManyRelation,
        modelClass: Application,
        join: {
          from: 'user.id',
          to: 'application.company_mentor_id',
        },
      },

      facultyMentorApplications: {
        relation: Model.HasManyRelation,
        modelClass: Application,
        join: {
          from: 'user.id',
          to: 'application.faculty_mentor_id',
        },
      },

      workDiaries: {
        relation: Model.HasManyRelation,
        modelClass: WorkDiary,
        join: {
          from: 'user.id',
          to: 'work_diary.student_id',
        },
      },

      practiceReports: {
        relation: Model.HasManyRelation,
        modelClass: PracticeReport,
        join: {
          from: 'user.id',
          to: 'practice_report.student_id',
        },
      },
    };
  }
}

module.exports = User;
