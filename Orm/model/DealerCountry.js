
const {
    bookshelf,
    knex,
    tables
} = require('../Database.js');

const DealerCountry = bookshelf.model('DealerCountry', {
    tableName: tables.dealer_country,
    initialize() {
        this.on('saving', (model, attr, options) => {
            attr.UpdateDate = knex.fn.now();
        });
    },
    dealer() {
        return this.belongsTo('Users', 'DealerID','ID');
    },
    dealerCountry() {
        return this.belongsTo('Country', 'CountryID','ID');
    }

});


DealerCountry.create_table = async () => {
    if (!await knex.schema.hasTable(tables.dealer_country)) {
        await knex.schema.createTable(tables.dealer_country, function (table) {
            table.bigIncrements('ID', {primaryKey: true}).primary();
            table.bigInteger('CountryID').unsigned().references('ID').inTable(tables.country).notNullable();
            table.bigInteger('DealerID').unsigned().references('ID').inTable(tables.user).notNullable();
            table.enum('Status', ['0', '1']).defaultTo('0').notNullable();
            table.timestamp('AddDate').defaultTo(knex.fn.now());
            table.timestamp('UpdateDate').defaultTo(knex.fn.now());
        });
    }
};




module.exports = DealerCountry;
