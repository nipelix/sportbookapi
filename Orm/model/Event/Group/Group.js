
const {
    bookshelf,
    knex,
    tables
} = require('../../../Database.js');

const Group = bookshelf.model('EventGroup', {
    tableName: tables.group,
    initialize() {
        this.on('saving', (model, attr, options) => {
            attr.UpdateDate = knex.fn.now();
        });
    },
    category() {
        return this.belongsTo('EventCategory', 'Category','ID');
    },
    events() {
        return this.hasMany('Event', 'Group','ID');
    },
    dealer() {
        return this.hasOne('EventDealer', 'Group','ID');
    },
    metas() {
        return this.hasMany('EventGroupMeta', 'Group','ID');
    },
    meta() {
        return this.hasOne('EventGroupMeta', 'Group','ID');
    },
});

Group.create_table = async () => {
    if (!await knex.schema.hasTable(tables.group)) {
        await knex.schema.createTable(tables.group, function (table) {
            table.bigIncrements('ID', {primaryKey: true}).primary();
            table.bigInteger('Category').unsigned().references('ID').inTable(tables.category).notNullable();
            table.enum('Status', ['0', '1']).defaultTo('1').notNullable();
            table.timestamp('AddDate').defaultTo(knex.fn.now());
            table.timestamp('UpdateDate').defaultTo(knex.fn.now());
        });
    }
};


module.exports = Group;
