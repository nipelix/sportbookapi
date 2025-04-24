const {
    bookshelf,
    knex,
    tables
} = require('../../../Database.js');

const Event = bookshelf.model('Event', {
    tableName: tables.event,
    initialize() {
        this.on('saving', (model, attr, options) => {
            attr.UpdateDate = knex.fn.now();
        });
    },
    category() {
        return this.belongsTo('EventCategory', 'Category','ID');
    },
   group() {
        return this.belongsTo('EventGroup', 'Group','ID');
    },
    external_mappings() {
        return this.hasMany('EventMapping', 'Event','ID');
    },
    external_mapping() {
        return this.hasOne('EventMapping', 'Event','ID');
    },
    metas() {
        return this.hasMany('EventMeta', 'Event','ID');
    },
    meta() {
        return this.hasOne('EventMeta', 'Event','ID');
    },
});

Event.create_table = async () => {
    if (!await knex.schema.hasTable(tables.event)) {
        await knex.schema.createTable(tables.event, function (table) {
            table.bigIncrements('ID', {primaryKey: true}).primary();
            table.bigInteger('Category').unsigned().references('ID').inTable(tables.category).notNullable();
            table.bigInteger('Group').unsigned().references('ID').inTable(tables.group).notNullable();
            table.timestamp('AddDate').defaultTo(knex.fn.now());
            table.timestamp('UpdateDate').defaultTo(knex.fn.now());
        });
    }
};

module.exports = Event;
