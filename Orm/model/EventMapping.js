const {
    bookshelf,
    knex,
    tables
} = require('../Database.js');

const EventMapping = bookshelf.model('EventMapping', {
    tableName: tables.event_mapping,
    initialize() {
        this.on('saving', (model, attr, options) => {
            attr.UpdateDate = knex.fn.now();
        });
    },
    champ() {

        return this.belongsTo('Event', 'LocalID','ID');
    }
});

EventMapping.create_table = async () => {
    if (!await knex.schema.hasTable(tables.event_mapping)) {
        await knex.schema.createTable(tables.event_mapping, function (table) {
            table.bigIncrements('ID', {primaryKey: true}).primary();
            table.bigInteger('LocalID').unsigned().references('ID').inTable(tables.event).notNullable();
            table.string('SourceID', 100).notNullable();
            table.enum('Source', ['melbet']).defaultTo('melbet').notNullable();
            table.timestamp('AddDate').defaultTo(knex.fn.now());
            table.timestamp('UpdateDate').defaultTo(knex.fn.now());
        });
    }
};




module.exports = EventMapping;
