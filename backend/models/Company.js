//const { Model } = require('objection');
import { Model } from 'objection';


class Company extends Model {
  static get tableName() {
    return 'company';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['company_oib', 'email', 'owner_id', 'sector_id'],

      properties: {
        id: { type: 'string', format: 'uuid' },
        company_oib: { type: 'string' },
        address: { type: 'string' },
        city: { type: 'string' },
        email: { type: 'string' },
        owner_id: { type: 'string', format: 'uuid' },
        sector_id: { type: 'string', format: 'uuid' },
      },
    };
  }

  static get relationMappings() {
    const User = import('./User');
    const Sector = import('./Sector');
    const Application = import('./Application');

    return {
      owner: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'company.owner_id',
          to: 'user.id',
        },
      },

      sector: {
        relation: Model.BelongsToOneRelation,
        modelClass: Sector,
        join: {
          from: 'company.sector_id',
          to: 'sector.id',
        },
      },

      applications: {
        relation: Model.HasManyRelation,
        modelClass: Application,
        join: {
          from: 'company.id',
          to: 'application.company_id',
        },
      },
    };
  }
}

export default Company;
//export default Company;