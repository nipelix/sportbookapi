const {
    bookshelf,
    knex,
    tables
} = require('../Database.js');

const Event = bookshelf.model('Event', {
    tableName: tables.event,
    initialize() {
        this.on('saving', (model, attr, options) => {
            attr.UpdateDate = knex.fn.now();
        });
    },
    eventCategory() {
        return this.belongsTo('EventCategory', 'EventCategoryID','ID');
    },
    eventGroup() {
        return this.belongsTo('EventGroup', 'EventGroupID','ID');
    },


    externalMappings() {
        return this.hasMany('EventMapping', 'LocalID','ID');
    },
    externalMapping() {
        return this.hasOne('EventMapping', 'LocalID','ID');
    }
});

Event.create_table = async () => {
    if (!await knex.schema.hasTable(tables.event)) {
        await knex.schema.createTable(tables.event, function (table) {
            table.bigIncrements('ID', {primaryKey: true}).primary();
            table.string('Name', 100).notNullable();
            table.bigInteger('EventCategoryID').unsigned().references('ID').inTable(tables.event_category).notNullable();
            table.bigInteger('EventGroupID').unsigned().references('ID').inTable(tables.event_group).notNullable();
            table.timestamp('AddDate').defaultTo(knex.fn.now());
            table.timestamp('UpdateDate').defaultTo(knex.fn.now());
        });
    }
};

module.exports = Event;
