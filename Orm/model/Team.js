
const {
    bookshelf,
    knex,
    tables
} = require('../Database.js');

const Team = bookshelf.model('Team', {
    tableName: tables.team,

    initialize() {
        this.on('saving', (model, attr, options) => {
            attr.UpdateDate = knex.fn.now();
        });
    },

    externalMappings() {
        return this.hasMany('TeamMapping', 'LocalID','ID');
    },

    externalMapping() {
        return this.hasOne('TeamMapping', 'LocalID','ID');

    },

    champs() {
        return this.hasOne('Champ', 'ChampID','ID');
    },

    sport() {
        return this.hasOne('Sport', 'SportID','ID');
    }

});

Team.create_table = async () => {
    if (!await knex.schema.hasTable(tables.team)) {
        await knex.schema.createTable(tables.team, function (table) {
            table.bigIncrements('ID', {primaryKey: true}).primary();
            table.bigInteger('SportID').unsigned().references('ID').inTable(tables.champ).notNullable();
            table.bigInteger('ChampID').unsigned().references('ID').inTable(tables.sport).notNullable();
            table.string('Name', 100).notNullable();
            table.string('Icon', 255).nullable();
            table.enum('Status', ['0', '1']).defaultTo('1').notNullable();
            table.timestamp('AddDate').defaultTo(knex.fn.now());
            table.timestamp('UpdateDate').defaultTo(knex.fn.now());
        });
    }
};



module.exports = Team;
