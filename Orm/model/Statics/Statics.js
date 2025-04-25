
const {
    bookshelf,
    knex,
    tables
} = require('../../Database.js');

const Mapping= require("./Mapping");
const Meta= require("./Meta");
const Statics = bookshelf.model('Statics', {
    tableName: tables.statics,

    initialize() {
        this.on('saving', (model, attr, options) => {
            attr.UpdateDate = knex.fn.now();
        });
    },
    external_mappings() {
        return this.hasMany('StaticsMapping', 'Statics','ID');
    },
    external_mapping() {
        return this.hasOne('StaticsMapping', 'Statics','ID');
    },
    metas() {
        return this.hasMany('StaticsMeta', 'Statics','ID');
    },

    meta() {
        return this.hasOne('StaticsMeta', 'Statics','ID');
    }
});


Statics.create_table = async () => {
    if (!await knex.schema.hasTable(tables.statics)) {
        await knex.schema.createTable(tables.statics, function (table) {
            table.bigIncrements('ID', {primaryKey: true}).primary();
            table.enum('Status', ['0', '1']).defaultTo('1').notNullable();
            table.timestamp('AddDate').defaultTo(knex.fn.now());
            table.timestamp('UpdateDate').defaultTo(knex.fn.now());
        });
    }
};



module.exports = Statics;
