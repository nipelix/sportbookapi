const {
    bookshelf,
    knex,
    tables
} = require('../Database.js');

const DealerChamp = bookshelf.model('DealerChamp', {
    tableName: tables.dealer_champ,
    initialize() {
        this.on('saving', (model, attr, options) => {
            attr.UpdateDate = knex.fn.now();
        });
    },
    champ() {
        return this.belongsTo('Champ', 'ChampID','ID');
    },
    dealer() {
        return this.belongsTo('Users', 'DealerID','ID');
    }
});

DealerChamp.create_table = async () => {
    if (!await knex.schema.hasTable(tables.dealer_champ)) {  // Tablo adını dealer_champ olarak değiştirin
        await knex.schema.createTable(tables.dealer_champ, function (table) {
            table.bigIncrements('ID', {primaryKey: true}).primary();
            table.bigInteger('ChampID').notNullable().unsigned().references('ID').inTable(tables.champ).notNullable();
            table.bigInteger('DealerID').notNullable().unsigned().references('ID').inTable(tables.user).notNullable();
            table.enum('Status', ['0', '1']).defaultTo('0').notNullable();
            table.timestamp('AddDate').defaultTo(knex.fn.now());
            table.timestamp('UpdateDate').defaultTo(knex.fn.now());
        });
    }
};

module.exports = DealerChamp;
