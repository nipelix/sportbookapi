
const {
    bookshelf,
    knex,
    tables
} = require('../Database.js');

const Balance = bookshelf.model('Balance', {
    tableName: tables.balance,

    initialize() {
        this.on('saving', (model, attr, options) => {
            attr.UpdateDate = knex.fn.now();
        });
    },
    user() {
        return this.belongsTo('User', 'UserID','ID');
    }
});

Balance.create_table = async () => {
    if (!await knex.schema.hasTable(tables.balance)) {
        await knex.schema.createTable(tables.balance, function (table) {
            table.bigIncrements('ID', {primaryKey: true}).primary();
            table.enum('Status', ['deposit', 'win', 'loss', 'transfer_in', 'transfer_out']).defaultTo('deposit').notNullable();
            table.enum('Type', ['casino', 'sport']).defaultTo('sport').notNullable();
            table.decimal('Amount', 10, 2).notNullable();
            table.bigInteger('UserID').unsigned().references('ID').inTable(tables.user).notNullable();
            table.timestamp('AddDate').defaultTo(knex.fn.now());
            table.timestamp('UpdateDate').defaultTo(knex.fn.now());
        });
    }
};



module.exports = Balance;
