const {
    bookshelf,
    knex,
    tables
} = require('../Database.js');
const { baseUrl } = require('../../config.js');
const fs = require("node:fs");
const Sport = bookshelf.model('Sport', {
    tableName: tables.sport,

    initialize() {
        this.on('saving', (model, attr, options) => {
            attr.UpdateDate = knex.fn.now();
        });
    },
    getIcon(){},
    externalMappings() {
        return this.hasMany('SportMapping', 'LocalID','ID');
    },

    externalMapping() {
        return this.hasOne('SportMapping', 'LocalID','ID');

    },

    champs() {
        return this.hasMany('Champ', 'SportID','ID');
    },

    dealerSport() {
        return this.hasOne('DealerSport', 'SportID','ID');
    },
    parse(att){
        att.readSvg = null;
        if(att.Icon){
            if(att.Icon.indexOf('.svg') > -1){
                att.readSvg = fs.readFileSync('public/'+att.Icon).toString('utf8');
            }
        }

        att.Icon =  baseUrl   + att.Icon +'?url';

        return att;
    }

} );

Sport.create_table = async () => {
    if (!await knex.schema.hasTable(tables.sport)) {
        await knex.schema.createTable(tables.sport, function (table) {
            table.bigIncrements('ID', {primaryKey: true}).primary();
            table.string('Name', 100).notNullable();
            table.string('Icon', 255).nullable();
            table.string('Slug', 255).nullable();
            table.string('Banner', 255).nullable();
            table.enum('Popular', ['0', '1']).defaultTo('0').notNullable();
            table.enum('Status', ['0', '1']).defaultTo('1').notNullable();
            table.timestamp('AddDate').defaultTo(knex.fn.now());
            table.timestamp('UpdateDate').defaultTo(knex.fn.now());

        });
    }
};



module.exports = Sport;
