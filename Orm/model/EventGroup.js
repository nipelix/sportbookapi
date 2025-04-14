
const {
    bookshelf,
    knex,
    tables
} = require('../Database.js');

const EventGroup = bookshelf.model('EventGroup', {
    tableName: tables.event_group,
    initialize() {
        this.on('saving', (model, attr, options) => {
            attr.UpdateDate = knex.fn.now();
        });
    },
    category() {
        return this.belongsTo('EventCategory', 'CategoryID','ID');
    },
    events() {
        return this.hasMany('Event', 'EventGroupID','ID');
    },
    dealerEvent() {
        return this.hasOne('DealerEvent', 'EventID','ID');
    }
});

EventGroup.create_table = async () => {
    if (!await knex.schema.hasTable(tables.event_group)) {
        await knex.schema.createTable(tables.event_group, function (table) {
            table.bigIncrements('ID', {primaryKey: true}).primary();
            table.string('Name', 100).notNullable();
            table.bigInteger('CategoryID').unsigned().references('ID').inTable(tables.event_category).notNullable();
            table.enum('Status', ['0', '1']).defaultTo('1').notNullable();
            table.timestamp('AddDate').defaultTo(knex.fn.now());
            table.timestamp('UpdateDate').defaultTo(knex.fn.now());
        });
    }
};


module.exports = EventGroup;
