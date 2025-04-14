const {
    bookshelf,
    knex,
    tables
} = require('../Database.js');

const Favorite = bookshelf.model('Favorite', {
    tableName: tables.favorite,
    initialize() {
        this.on('saving', (model, attr, options) => {
            attr.UpdateDate = knex.fn.now();
        });
    },
    champ() {
        return this.belongsTo('Champ', 'ChampID','ID');
    },
    user() {
        return this.belongsTo('Users', 'UserID','ID');
    }
});

Favorite.create_table = async () => {
    if (!await knex.schema.hasTable(tables.favorite)) {
        await knex.schema.createTable(tables.favorite, function (table) {
            table.bigIncrements('ID', {primaryKey: true}).primary();
            table.bigInteger('ChampID').notNullable().unsigned().references('ID').inTable(tables.champ).notNullable();
            table.bigInteger('UserID').notNullable().unsigned().references('ID').inTable(tables.user).notNullable();
            table.timestamp('AddDate').defaultTo(knex.fn.now());
            table.timestamp('UpdateDate').defaultTo(knex.fn.now());
        });
    }
};

module.exports = Favorite;
