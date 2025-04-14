
const {
    bookshelf,
    knex,
    tables
} = require('../Database.js');

const DealerTeam = bookshelf.model('DealerTeam', {
    tableName: tables.dealer_team,
    initialize() {
        this.on('saving', (model, attr, options) => {
            attr.UpdateDate = knex.fn.now();
        });
    },

    dealer() {
        return this.belongsTo('Users', 'DealerID','ID');
    },

    team() {
        return this.belongsTo('Team', 'TeamID','ID');
    }

});


DealerTeam.create_table = async () => {
    if (!await knex.schema.hasTable(tables.dealer_team)) {
        await knex.schema.createTable(tables.dealer_team, function (table) {
            table.bigIncrements('ID', {primaryKey: true}).primary();
            table.bigInteger('TeamID').unsigned().references('ID').inTable(tables.team).notNullable();
            table.bigInteger('DealerID').unsigned().references('ID').inTable(tables.user).notNullable();
            table.enum('Status', ['0', '1']).defaultTo('0').notNullable();
            table.timestamp('AddDate').defaultTo(knex.fn.now());
            table.timestamp('UpdateDate').defaultTo(knex.fn.now());
        });
    }
};





module.exports = DealerTeam;
