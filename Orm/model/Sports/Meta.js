const {
    bookshelf,
    knex,
    tables
} = require('../../Database.js');

const Meta = bookshelf.model('SportMeta', {
    tableName: tables.sport_meta,
    initialize() {

        this.on('saving', (model, attr, options) => {

            attr.UpdateDate = knex.fn.now();
        });
    },
    sport() {
        return this.belongsTo('Sport', 'Sport','ID');
    },
    language() {
        return this.belongsTo('Language', 'Language','ID');
    }
});


Meta.create_table = async () => {
    if (!await knex.schema.hasTable(tables.sport_meta)) {
        await knex.schema.createTable(tables.sport_meta, function (table) {
            table.bigIncrements('ID', { primaryKey: true }).primary();
            table.string('Name', 100).notNullable();
            table.string('Slug', 255).nullable().unique();
            table.bigInteger('Sport').unsigned().references('ID').inTable(tables.sport).notNullable();
            table.bigInteger('Language').unsigned().references('ID').inTable(tables.language).notNullable();
            table.timestamp('AddDate').defaultTo(knex.fn.now());
            table.timestamp('UpdateDate').defaultTo(knex.fn.now());
        });
    }
};



module.exports = Meta;
