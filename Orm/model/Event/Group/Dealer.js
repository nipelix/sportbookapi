
const {
    bookshelf,
    knex,
    tables
} = require('../../../Database.js');

const Dealer = bookshelf.model('EventDealer', {
    tableName: tables.group_dealer,
    initialize() {
        this.on('saving', (model, attr, options) => {
            attr.UpdateDate = knex.fn.now();
        });
    },
    dealer() {
        return this.belongsTo('Users', 'Dealer','ID');
    },
    event() {
        return this.belongsTo('Group', 'Group','ID');
    }

});


Dealer.create_table = async () => {
    if (!await knex.schema.hasTable(tables.group_dealer)) {
        await knex.schema.createTable(tables.group_dealer, function (table) {
            table.bigIncrements('ID', {primaryKey: true}).primary();
            table.bigInteger('Group').unsigned().references('ID').inTable(tables.group).notNullable();
            table.bigInteger('Dealer').unsigned().references('ID').inTable(tables.user).notNullable();
            table.enum('Status', ['0', '1']).defaultTo('0').notNullable();
            table.timestamp('AddDate').defaultTo(knex.fn.now());
            table.timestamp('UpdateDate').defaultTo(knex.fn.now());
        });
    }
};





module.exports = Dealer;
