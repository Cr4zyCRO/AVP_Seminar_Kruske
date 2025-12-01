const { Model } = require('objection');

class Sector extends Model {
  static get tableName() {
    return 'sector';
  }

  static get idColumn() {
    return 'id';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['sector_name'],

      properties: {
        id: { type: 'string', format: 'uuid' },
        sector_name: { type: 'string' },
      },
    };
  }

  static get relationMappings() {
    const Company = require('./Company');

    return {
      companies: {
        relation: Model.HasManyRelation,
        modelClass: Company,
        join: {
          from: 'sector.id',
          to: 'company.sector_id',
        },
      },
    };
  }
}

module.exports = Sector;
