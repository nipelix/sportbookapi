
const {
    bookshelf,
    knex,
    tables
} = require('../../../Database.js');

const Category = bookshelf.model('EventCategory', {
    tableName: tables.category,
    initialize() {
        this.on('saving', (model, attr, options) => {
            attr.UpdateDate = knex.fn.now();
        });
    },
    groups() {
        return this.hasMany('EventGroup', 'Category','ID');
    },
    events() {
        return this.hasMany('Event', 'Category','ID');
    },
    metas() {
        return this.hasMany('EventCategoryMeta', 'Category','ID');
    },

    meta() {
        return this.hasOne('EventCategoryMeta', 'Category','ID');
    },
});

Category.create_table = async () => {
    if (!await knex.schema.hasTable(tables.category)) {
        await knex.schema.createTable(tables.category, function (table) {
            table.bigIncrements('ID', {primaryKey: true}).primary();
            table.enum('Status', ['0', '1']).defaultTo('1').notNullable();
            table.timestamp('AddDate').defaultTo(knex.fn.now());
            table.timestamp('UpdateDate').defaultTo(knex.fn.now());
        });
    }
};



module.exports = Category;
