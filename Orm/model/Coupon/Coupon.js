const {
    bookshelf,
    knex,
    tables
} = require('../../Database.js');

const Coupon = bookshelf.model('Coupon', {
    tableName: tables.coupon,
    initialize() {
        this.on('saving', (model, attr, options) => {
            attr.UpdateDate = knex.fn.now();
        });
    },

    user() {
        return this.belongsTo('Users', 'User','ID');
    },

    events() {
        return this.hasMany('CouponEvent', 'Coupon','ID');
    }

});

Coupon.create_table = async () => {
    if (!await knex.schema.hasTable(tables.coupon)) {
        await knex.schema.createTable(tables.coupon, function (table) {
            table.bigIncrements('ID', {primaryKey: true}).primary();
            table.bigInteger('User').notNullable().unsigned().references('ID').inTable(tables.user).notNullable();
            table.timestamp('AddDate').defaultTo(knex.fn.now());
            table.timestamp('UpdateDate').defaultTo(knex.fn.now());
        });
    }
};

module.exports = Coupon;
