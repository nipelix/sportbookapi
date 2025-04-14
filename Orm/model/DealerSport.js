
const {
    bookshelf,
    knex,
    tables
} = require('../Database.js');

const DealerSport = bookshelf.model('DealerSport', {
    tableName: tables.dealer_sport,
    initialize() {
        this.on('saving', (model, attr, options) => {
            attr.UpdateDate = knex.fn.now();
        });
    },
    sport() {
        return this.belongsTo('Sport', 'SportID','ID');
    },
    dealer() {
        return this.belongsTo('Users', 'DealerID','ID');
    }

});

DealerSport.create_table = async () => {
    if (!await knex.schema.hasTable(tables.dealer_sport)) {
        await knex.schema.createTable(tables.dealer_sport, function (table) {
            table.bigIncrements('ID', {primaryKey: true}).primary();
            table.bigInteger('SportID').unsigned().references('ID').inTable(tables.sport).notNullable();
            table.bigInteger('DealerID').unsigned().references('ID').inTable(tables.user).notNullable();
            table.enum('Status', ['0', '1']).defaultTo('0').notNullable();
            table.timestamp('AddDate').defaultTo(knex.fn.now());
            table.timestamp('UpdateDate').defaultTo(knex.fn.now());
        });
    }
};




module.exports = DealerSport;
