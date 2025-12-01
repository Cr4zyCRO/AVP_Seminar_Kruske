const { Model } = require('objection');

class Application extends Model {
  static get tableName() {
    return 'application';
  }

  static get idColumn() {
    return 'id';
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
    const User = require('./User');
    const Company = require('./Company');
    const Certificate = require('./Certificate');
    const WorkDiary = require('./WorkDiary');
    const PracticeReport = require('./PracticeReport');

    return {
      student: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'application.student_id',
          to: 'user.id',
        },
      },

      company: {
        relation: Model.BelongsToOneRelation,
        modelClass: Company,
        join: {
          from: 'application.company_id',
          to: 'company.id',
        },
      },

      companyMentor: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'application.company_mentor_id',
          to: 'user.id',
        },
      },

      facultyMentor: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'application.faculty_mentor_id',
          to: 'user.id',
        },
      },

      certificates: {
        relation: Model.HasManyRelation,
        modelClass: Certificate,
        join: {
          from: 'application.id',
          to: 'certificate.application_id',
        },
      },

      workDiaries: {
        relation: Model.HasManyRelation,
        modelClass: WorkDiary,
        join: {
          from: 'application.id',
          to: 'work_diary.application_id',
        },
      },

      practiceReports: {
        relation: Model.HasManyRelation,
        modelClass: PracticeReport,
        join: {
          from: 'application.id',
          to: 'practice_report.application_id',
        },
      },
    };
  }
}

module.exports = Application;
