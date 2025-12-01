const { Model } = require('objection');

class PracticeReport extends Model {
  static get tableName() {
    return 'practice_report';
  }

  static get idColumn() {
    return 'id';
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
    const Application = require('./Application');
    const User = require('./User');

    return {
      application: {
        relation: Model.BelongsToOneRelation,
        modelClass: Application,
        join: {
          from: 'practice_report.application_id',
          to: 'application.id',
        },
      },

      student: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'practice_report.student_id',
          to: 'user.id',
        },
      },

      facultyMentor: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'practice_report.faculty_mentor_id',
          to: 'user.id',
        },
      },
    };
  }
}

module.exports = PracticeReport;
