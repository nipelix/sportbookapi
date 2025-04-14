
const {
    bookshelf,
    knex,
    tables
} = require('../Database.js');

const SportMapping = bookshelf.model('SportMapping', {
    tableName: tables.sport_mapping,
    initialize() {
        this.on('saving', (model, attr, options) => {
            attr.UpdateDate = knex.fn.now();
        });
    },
    sport() {
        return this.belongsTo('Sport', 'LocalID','ID');
    }
});

SportMapping.create_table = async () => {
    if (!await knex.schema.hasTable(tables.sport_mapping)) {
        await knex.schema.createTable(tables.sport_mapping, function (table) {
            table.bigIncrements('ID', {primaryKey: true}).primary();
            table.bigInteger('LocalID').unsigned().references('ID').inTable(tables.sport).notNullable();
            table.string('SourceID', 100).notNullable();
            table.enum('Source', ['melbet']).defaultTo('melbet').notNullable();
            table.timestamp('AddDate').defaultTo(knex.fn.now());
            table.timestamp('UpdateDate').defaultTo(knex.fn.now());
        });
    }
};




module.exports = SportMapping;
