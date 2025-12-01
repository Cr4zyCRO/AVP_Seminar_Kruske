const { Model } = require('objection');

class Certificate extends Model {
  static get tableName() {
    return 'certificate';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['student_id', 'application_id', 'certificate_name'],

      properties: {
        id: { type: 'string', format: 'uuid' },
        student_id: { type: 'string', format: 'uuid' },
        application_id: { type: 'string', format: 'uuid' },
        certificate_name: { type: 'string' },
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
          from: 'certificate.student_id',
          to: 'user.id',
        },
      },

      application: {
        relation: Model.BelongsToOneRelation,
        modelClass: Application,
        join: {
          from: 'certificate.application_id',
          to: 'application.id',
        },
      },
    };
  }
}

module.exports = Certificate;
