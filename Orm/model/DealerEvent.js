
const {
    bookshelf,
    knex,
    tables
} = require('../Database.js');

const DealerEvent = bookshelf.model('DealerEvent', {
    tableName: tables.dealer_event,
    initialize() {
        this.on('saving', (model, attr, options) => {
            attr.UpdateDate = knex.fn.now();
        });
    },
    dealer() {
        return this.belongsTo('Users', 'DealerID','ID');
    },
    event() {
        return this.belongsTo('EventGroup', 'EventID','ID');
    }

});


DealerEvent.create_table = async () => {
    if (!await knex.schema.hasTable(tables.dealer_event)) {
        await knex.schema.createTable(tables.dealer_event, function (table) {
            table.bigIncrements('ID', {primaryKey: true}).primary();
            table.bigInteger('EventID').unsigned().references('ID').inTable(tables.event_group).notNullable();
            table.bigInteger('DealerID').unsigned().references('ID').inTable(tables.user).notNullable();
            table.enum('Status', ['0', '1']).defaultTo('0').notNullable();
            table.timestamp('AddDate').defaultTo(knex.fn.now());
            table.timestamp('UpdateDate').defaultTo(knex.fn.now());
        });
    }
};





module.exports = DealerEvent;
