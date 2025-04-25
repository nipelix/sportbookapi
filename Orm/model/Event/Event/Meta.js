
const {
    bookshelf,
    knex,
    tables
} = require('../../../Database.js');

const Meta = bookshelf.model('EventMeta', {
    tableName: tables.event_meta,
    initialize() {
        this.on('saving', (model, attr, options) => {
            attr.UpdateDate = knex.fn.now();
        });
    },
    event() {
        return this.belongsTo('Event', 'Event','ID');
    },
    language() {
        return this.belongsTo('Language', 'Language','ID');
    }
});


Meta.create_table = async () => {
    if (!await knex.schema.hasTable(tables.event_meta)) {
        await knex.schema.createTable(tables.event_meta, function (table) {
            table.bigIncrements('ID', { primaryKey: true }).primary();
            table.string('Name', 100).notNullable();
            table.bigInteger('Event').unsigned().references('ID').inTable(tables.event).notNullable();
            table.bigInteger('Language').unsigned().references('ID').inTable(tables.language).notNullable();
            table.timestamp('AddDate').defaultTo(knex.fn.now());
            table.timestamp('UpdateDate').defaultTo(knex.fn.now());
        });
    }
};



module.exports = Meta;
