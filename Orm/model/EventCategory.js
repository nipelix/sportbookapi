
const {
    bookshelf,
    knex,
    tables
} = require('../Database.js');

const EventCategory = bookshelf.model('EventCategory', {
    tableName: tables.event_category,
    initialize() {
        this.on('saving', (model, attr, options) => {
            attr.UpdateDate = knex.fn.now();
        });
    },
    eventGroups() {
        return this.hasMany('EventGroup', 'CategoryID','ID');
    },
    events() {
        return this.hasMany('Event', 'EventCategoryID','ID');
    }
});

EventCategory.create_table = async () => {
    if (!await knex.schema.hasTable(tables.event_category)) {
        await knex.schema.createTable(tables.event_category, function (table) {
            table.bigIncrements('ID', {primaryKey: true}).primary();
            table.string('Name', 100).notNullable();
            table.timestamp('AddDate').defaultTo(knex.fn.now());
            table.timestamp('UpdateDate').defaultTo(knex.fn.now());
        });
    }
};



module.exports = EventCategory;
