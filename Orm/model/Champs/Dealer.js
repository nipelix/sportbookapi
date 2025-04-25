const {
    bookshelf,
    knex,
    tables
} = require('../../Database.js');

const Dealer = bookshelf.model('DealerChamp', {
    tableName: tables.champ_dealer,
    initialize() {
        this.on('saving', (model, attr, options) => {
            attr.UpdateDate = knex.fn.now();
        });
    },
    champ() {
        return this.belongsTo('Champ', 'Champ','ID');
    },
    dealer() {
        return this.belongsTo('Users', 'Dealer','ID');
    }
});

Dealer.create_table = async () => {
    if (!await knex.schema.hasTable(tables.champ_dealer)) {
        await knex.schema.createTable(tables.champ_dealer, function (table) {
            table.bigIncrements('ID', {primaryKey: true}).primary();
            table.bigInteger('Champ').notNullable().unsigned().references('ID').inTable(tables.champ).notNullable();
            table.bigInteger('Dealer').notNullable().unsigned().references('ID').inTable(tables.user).notNullable();
            table.enum('Status', ['0', '1']).defaultTo('0').notNullable();
            table.timestamp('AddDate').defaultTo(knex.fn.now());
            table.timestamp('UpdateDate').defaultTo(knex.fn.now());
        });
    }
};

module.exports = Dealer;
