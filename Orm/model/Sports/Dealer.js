const {
    bookshelf,
    knex,
    tables
} = require('../../Database.js');

const Dealer = bookshelf.model('DealerSport', {
    tableName: tables.sport_dealer,
    initialize() {
        this.on('saving', (model, attr, options) => {
            attr.UpdateDate = knex.fn.now();
        });
    },

    sport() {
        return this.belongsTo('Sport', 'Sport','ID');
    },

    dealer() {
        return this.belongsTo('Users', 'Dealer','ID');
    }
});

Dealer.create_table = async () => {
    if (!await knex.schema.hasTable(tables.sport_dealer)) {
        await knex.schema.createTable(tables.sport_dealer, function (table) {
            table.bigIncrements('ID', {primaryKey: true}).primary();
            table.bigInteger('Sport').unsigned().references('ID').inTable(tables.sport).notNullable();
            table.bigInteger('Dealer').unsigned().references('ID').inTable(tables.user).notNullable();
            table.enum('Status', ['0', '1']).defaultTo('0').notNullable();
            table.timestamp('AddDate').defaultTo(knex.fn.now());
            table.timestamp('UpdateDate').defaultTo(knex.fn.now());
        });
    }
};




module.exports = Dealer;
