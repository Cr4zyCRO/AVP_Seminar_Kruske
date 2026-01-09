import { Model } from 'objection';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class WorkDiary extends Model {
  static get tableName() {
    return 'work_diary';
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
    return {
      student: {
        relation: Model.BelongsToOneRelation,
        modelClass: path.join(__dirname, 'User.js'),
        join: {
          from: 'work_diary.student_id',
          to: 'user.id',
        },
      },

      application: {
        relation: Model.BelongsToOneRelation,
        modelClass: path.join(__dirname, 'Application.js'),
        join: {
          from: 'work_diary.application_id',
          to: 'application.id',
        },
      },
    };
  }
}

export default WorkDiary;
