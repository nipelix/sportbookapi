
const {
    bookshelf,
    knex,
    tables
} = require('../../../Database.js');

const Meta = bookshelf.model('EventGroupMeta', {
    tableName: tables.group_meta,
    initialize() {
        this.on('saving', (model, attr, options) => {
            attr.UpdateDate = knex.fn.now();
        });
    },
    group() {
        return this.belongsTo('EventGroup', 'Group','ID');
    },
    language() {
        return this.belongsTo('Language', 'Language','ID');
    }
});

Meta.create_table = async () => {
    if (!await knex.schema.hasTable(tables.group_meta)) {
        await knex.schema.createTable(tables.group_meta, function (table) {
            table.bigIncrements('ID', { primaryKey: true }).primary();
            table.string('Name', 100).notNullable();
            table.bigInteger('Group').unsigned().references('ID').inTable(tables.group).notNullable();
            table.bigInteger('Language').unsigned().references('ID').inTable(tables.language).notNullable();
            table.timestamp('AddDate').defaultTo(knex.fn.now());
            table.timestamp('UpdateDate').defaultTo(knex.fn.now());
        });
    }
};



module.exports = Meta;
