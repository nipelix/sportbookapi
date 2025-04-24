
const {
    bookshelf,
    knex,
    tables
} = require('../../Database.js');

const Mapping = bookshelf.model('ChampMapping', {
    tableName: tables.champ_mapping,
    initialize() {
        this.on('saving', (model, attr, options) => {
            attr.UpdateDate = knex.fn.now();
        });
    },
    champ() {
        return this.belongsTo('Champ', 'Champ','ID');
    }
});

Mapping.create_table = async () => {
    if (!await knex.schema.hasTable(tables.champ_mapping)) {
        await knex.schema.createTable(tables.champ_mapping, function (table) {
            table.bigIncrements('ID', {primaryKey: true}).primary();
            table.bigInteger('Champ').unsigned().references('ID').inTable(tables.champ).notNullable();
            table.string('SourceID', 100).notNullable();
            table.enum('Source', ['melbet']).defaultTo('melbet').notNullable();
            table.timestamp('AddDate').defaultTo(knex.fn.now());
            table.timestamp('UpdateDate').defaultTo(knex.fn.now());
        });
    }
};




module.exports = Mapping;
