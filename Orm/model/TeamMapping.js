const {
    bookshelf,
    knex,
    tables
} = require('../Database.js');

const TeamMapping = bookshelf.model('TeamMapping', {
    tableName: tables.team_mapping,
    initialize() {
        this.on('saving', (model, attr, options) => {
            attr.UpdateDate = knex.fn.now();
        });
    },
    team() {
        return this.belongsTo('Team', 'LocalID','ID');
    }
});

TeamMapping.create_table = async () => {
    if (!await knex.schema.hasTable(tables.team_mapping)) {
        await knex.schema.createTable(tables.team_mapping, function (table) {
            table.bigIncrements('ID', {primaryKey: true}).primary();
            table.bigInteger('LocalID').unsigned().references('ID').inTable(tables.event).notNullable();
            table.string('SourceID', 100).notNullable();
            table.enum('Source', ['melbet']).defaultTo('melbet').notNullable();
            table.timestamp('AddDate').defaultTo(knex.fn.now());
            table.timestamp('UpdateDate').defaultTo(knex.fn.now());
        });
    }
};




module.exports = TeamMapping;
