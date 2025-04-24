
const {
    bookshelf,
    knex,
    tables
} = require('../../Database.js');

const Mapping = bookshelf.model('StaticsMapping', {
    tableName: tables.statics_mapping,
    initialize() {
        this.on('saving', (model, attr, options) => {
            attr.UpdateDate = knex.fn.now();
        });
    },
    champ() {
        return this.belongsTo('Statics', 'Statics','ID');
    }
});

Mapping.create_table = async () => {
    if (!await knex.schema.hasTable(tables.statics_mapping)) {
        await knex.schema.createTable(tables.statics_mapping, function (table) {
            table.bigIncrements('ID', {primaryKey: true}).primary();
            table.bigInteger('Statics').unsigned().references('ID').inTable(tables.champ).notNullable();
            table.string('SourceID', 100).notNullable();
            table.enum('Source', ['melbet']).defaultTo('melbet').notNullable();
            table.timestamp('AddDate').defaultTo(knex.fn.now());
            table.timestamp('UpdateDate').defaultTo(knex.fn.now());
        });
    }
};




module.exports = Mapping;
