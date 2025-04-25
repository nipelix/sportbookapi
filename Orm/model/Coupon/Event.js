const {
    bookshelf,
    knex,
    tables
} = require('../../Database.js');

const Event = bookshelf.model('CouponEvent', {
    tableName: tables.coupon_event,
    initialize() {
        this.on('saving', (model, attr, options) => {
            attr.UpdateDate = knex.fn.now();
        });
    },

    coupon() {
        return this.belongsTo('Coupon', 'Coupon','ID');
    },

    event() {
        return this.belongsTo('Event', 'Event','ID');
    }

});

Event.create_table = async () => {
    if (!await knex.schema.hasTable(tables.coupon_event)) {
        await knex.schema.createTable(tables.coupon_event, function (table) {
            table.bigIncrements('ID', {primaryKey: true}).primary();
            table.bigInteger('Coupon').notNullable().unsigned().references('ID').inTable(tables.coupon).notNullable();
            table.bigInteger('Event').notNullable().unsigned().references('ID').inTable(tables.event).notNullable();
            table.double('Ratio', 20,2).defaultTo(0);
            table.double('Price', 20,2).defaultTo(0);
            table.enum('Status', ['0','1','2']).defaultTo('0');
            table.string('SourceID', 100).notNullable();
            table.enum('Source', ['melbet']).defaultTo('melbet').notNullable();
            table.timestamp('AddDate').defaultTo(knex.fn.now());
            table.timestamp('UpdateDate').defaultTo(knex.fn.now());
        });
    }
};

module.exports = Event;
