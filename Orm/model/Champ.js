
const {
    bookshelf,
    knex,
    tables
} = require('../Database.js');
const fs = require("node:fs");
const {baseUrl} = require("../../config");

const Champ = bookshelf.model('Champ', {
    tableName: tables.champ,

    initialize() {
        this.on('saving', (model, attr, options) => {
            attr.UpdateDate = knex.fn.now();
        });
    },
    externalMappings() {
        return this.hasMany('ChampMapping', 'LocalID','ID');
    },
    externalMapping() {
        return this.hasOne('ChampMapping', 'LocalID','ID');
    },
    sport() {
        return this.belongsTo('Sport', 'SportID','ID');
    },
    country() {
        return this.belongsTo('Country', 'CountryID','ID');
    },
    dealerChamp() {
        return this.hasOne('DealerChamp', 'ChampID','ID');
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



});

Champ.create_table = async () => {
    if (!await knex.schema.hasTable(tables.champ)) {
        await knex.schema.createTable(tables.champ, function (table) {
            table.bigIncrements('ID', {primaryKey: true}).primary();
            table.string('Name', 100).notNullable();
            table.string('Icon', 255).nullable();
            table.bigInteger('SportID').unsigned().references('ID').inTable(tables.sport).notNullable();
            table.bigInteger('CountryID').unsigned().references('ID').inTable(tables.country).notNullable();
            table.enum('Popular', ['0', '1']).defaultTo('0').notNullable();
            table.enum('Status', ['0', '1']).defaultTo('1').notNullable();
            table.string('Banner', 255).nullable();
            table.timestamp('AddDate').defaultTo(knex.fn.now());
            table.timestamp('UpdateDate').defaultTo(knex.fn.now());
        });
    }
};



module.exports = Champ;
