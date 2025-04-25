const {
    bookshelf,
    knex,
    tables
} = require('../../Database.js');
const { baseUrl } = require('../../../config.js');
const fs = require("node:fs");
const Sport = bookshelf.model('Sport', {
    tableName: tables.sport,
    initialize() {
        this.on('saving', (model, attr, options) => {
            attr.UpdateDate = knex.fn.now();
        });
    },
    external_mappings() {
        return this.hasMany('SportMapping', 'Sport','ID');
    },

    external_mapping() {
        return this.hasOne('SportMapping', 'Sport','ID');

    },

    metas() {
        return this.hasMany('SportMeta', 'Sport','ID');
    },

    meta() {
        return this.hasOne('SportMeta', 'Sport','ID');
    },

    champs() {
        return this.hasMany('Champ', 'Sport','ID');
    },

    dealer() {
        return this.hasOne('DealerSport', 'Sport','ID');
    },

    parse(att){
        if(att.hasOwnProperty('Icon')) {
            att.read_svg = null;
            if (att.Icon) {
                if (att.Icon.indexOf('.svg') > -1) {
                    att.read_svg = fs.readFileSync('public/' + att.Icon).toString('utf8');
                }
            }

        }

        return att;
    }

} );

Sport.create_table = async () => {
    if (!await knex.schema.hasTable(tables.sport)) {
        await knex.schema.createTable(tables.sport, function (table) {
            table.bigIncrements('ID', {primaryKey: true}).primary();
            table.string('Icon', 255).nullable();
            table.string('Banner', 255).nullable();
            table.enum('Popular', ['0', '1']).defaultTo('0').notNullable();
            table.enum('Status', ['0', '1']).defaultTo('1').notNullable();
            table.timestamp('AddDate').defaultTo(knex.fn.now());
            table.timestamp('UpdateDate').defaultTo(knex.fn.now());
        });
    }
};



module.exports = Sport;
