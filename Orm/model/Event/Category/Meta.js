
const {
    bookshelf,
    knex,
    tables
} = require('../../../Database.js');

const Meta = bookshelf.model('EventCategoryMeta', {
    tableName: tables.category_meta,
    initialize() {
        this.on('saving', (model, attr, options) => {
            attr.UpdateDate = knex.fn.now();
        });
    },
    category() {
        return this.belongsTo('EventCategory', 'Category','ID');
    },
    language() {
        return this.belongsTo('Language', 'Language','ID');
    }
});

Meta.create_table = async () => {
    if (!await knex.schema.hasTable(tables.category_meta)) {
        await knex.schema.createTable(tables.category_meta, function (table) {
            table.bigIncrements('ID', { primaryKey: true }).primary();
            table.string('Name', 100).notNullable();
            table.bigInteger('Category').unsigned().references('ID').inTable(tables.category).notNullable();
            table.bigInteger('Language').unsigned().references('ID').inTable(tables.language).notNullable();
            table.timestamp('AddDate').defaultTo(knex.fn.now());
            table.timestamp('UpdateDate').defaultTo(knex.fn.now());
        });
    }
};



module.exports = Meta;
