
const {
    bookshelf,
    knex,
    tables
} = require('../Database.js');




const Country = bookshelf.model('Country', {
    tableName: tables.country,

    initialize() {
        this.on('saving', (model, attr, options) => {
            attr.UpdateDate = knex.fn.now();
        });
    },
    champs() {
        return this.hasMany('Champ', 'CountryID','ID');
    },
    dealerCountry() {
        return this.hasOne('DealerCountry', 'CountryID','ID');
    }

});

Country.create_table = async () => {
    if (!await knex.schema.hasTable(tables.country)) {
        await knex.schema.createTable(tables.country, function (table) {
            table.bigIncrements('ID', {primaryKey: true}).primary();
            table.string('Name', 100).notNullable().unique();
            table.string('Code', 3).notNullable().unique();
            table.string('Flag', 255).nullable();
            table.enum('Status', ['0', '1']).defaultTo('1').notNullable();
            table.timestamp('AddDate').defaultTo(knex.fn.now());
            table.timestamp('UpdateDate').defaultTo(knex.fn.now());
        });
    }
};

module.exports = Country;