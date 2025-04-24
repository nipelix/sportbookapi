const {
    bookshelf,
    knex,
    tables
} = require('../../Database.js');

const Meta = bookshelf.model('ChampMeta', {
    tableName: tables.champ_meta,
    initialize() {
        this.on('saving', (model, attr, options) => {
            attr.UpdateDate = knex.fn.now();
        });
    },
    champ() {
        return this.belongsTo('Champ', 'Champ','ID');
    },
    language() {
        return this.belongsTo('Language', 'Language','ID');
    }
});



Meta.create_table = async () => {
    if (!await knex.schema.hasTable(tables.champ_meta)) {
        await knex.schema.createTable(tables.champ_meta, function (table) {
            table.bigIncrements('ID', { primaryKey: true }).primary();
            table.string('Name', 100).notNullable();
            table.string('Slug', 255).nullable().unique();
            table.bigInteger('Champ').unsigned().references('ID').inTable(tables.champ).notNullable();
            table.bigInteger('Language').unsigned().references('ID').inTable(tables.language).notNullable();
            table.timestamp('AddDate').defaultTo(knex.fn.now());
            table.timestamp('UpdateDate').defaultTo(knex.fn.now());
        });
    }
};



module.exports = Meta;
