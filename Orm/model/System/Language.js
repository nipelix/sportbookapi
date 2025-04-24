
const {
    bookshelf,
    knex,
    tables
} = require('../../Database.js');

const Language = bookshelf.model('Language', {
    tableName: tables.language,
    initialize() {
        this.on('saving', (model, attr, options) => {
            attr.UpdateDate = knex.fn.now();
        });
    }
});



Language.create_table = async () => {
    if (!await knex.schema.hasTable(tables.language)) {
        await knex.schema.createTable(tables.language, function (table) {
            table.bigIncrements('ID', {primaryKey: true}).primary();
            table.string('Name', 100).notNullable();
            table.string('code', 3).unique().notNullable();
            table.string('Icon', 255).nullable();
            table.enum('Status', ['0', '1']).defaultTo('0').notNullable();
            table.timestamp('AddDate').defaultTo(knex.fn.now());
            table.timestamp('UpdateDate').defaultTo(knex.fn.now());
        });
    }
};



module.exports = Language;
