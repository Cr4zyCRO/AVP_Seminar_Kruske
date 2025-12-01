const { Model } = require('objection');

class WorkDiary extends Model {
  static get tableName() {
    return 'work_diary';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['student_id', 'application_id', 'content', 'status'],

      properties: {
        id: { type: 'string', format: 'uuid' },
        student_id: { type: 'string', format: 'uuid' },
        application_id: { type: 'string', format: 'uuid' },
        content: { type: 'string' },
        status: { type: 'string' },
      },
    };
  }

  static get relationMappings() {
    const User = require('./User');
    const Application = require('./Application');

    return {
      student: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'work_diary.student_id',
          to: 'user.id',
        },
      },

      application: {
        relation: Model.BelongsToOneRelation,
        modelClass: Application,
        join: {
          from: 'work_diary.application_id',
          to: 'application.id',
        },
      },
    };
  }
}

module.exports = WorkDiary;
