
const {
    bookshelf,
    knex,
    tables
} = require('../Database.js');

const Credit = bookshelf.model('Credit', {
    tableName: tables.credit,

    initialize() {
        this.on('saving', (model, attr, options) => {
            attr.UpdateDate = knex.fn.now();
        });
    },
    dealer() {
        return this.belongsTo('User', 'DealerID','ID');
    }

});

Credit.create_table = async () => {
    if (!await knex.schema.hasTable(tables.credit)) {
        await knex.schema.createTable(tables.credit, function (table) {
            table.bigIncrements('ID', {primaryKey: true}).primary();
            table.enum('Status', ['expense', 'deposit']).defaultTo('deposit').notNullable();
            table.enum('Type', ['casino', 'sport']).defaultTo('sport').notNullable();
            table.decimal('Amount', 10, 2).notNullable();
            table.bigInteger('DealerID').unsigned().references('ID').inTable(tables.user).notNullable();
            table.timestamp('AddDate').defaultTo(knex.fn.now());
            table.timestamp('UpdateDate').defaultTo(knex.fn.now());
        });
    }
};



module.exports = Credit;
