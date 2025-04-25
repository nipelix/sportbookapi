
const {
    bookshelf,
    knex,
    tables
} = require('../../Database.js');
const fs = require("node:fs");
const {baseUrl} = require("../../../config");

const Champ = bookshelf.model('Champ', {
    tableName: tables.champ,

    initialize() {
        this.on('saving', (model, attr, options) => {
            attr.UpdateDate = knex.fn.now();
        });
    },
    external_mappings() {
        return this.hasMany('ChampMapping', 'Champ','ID');
    },
    external_mapping() {
        return this.hasOne('ChampMapping', 'Champ','ID');
    },
    metas() {
        return this.hasMany('ChampMeta', 'Champ','ID');
    },

    meta() {
        return this.hasOne('ChampMeta', 'Champ','ID');
    },
    sport() {
        return this.belongsTo('Sport', 'Sport','ID');
    },
    parent() {
        return this.belongsTo('Champ', 'Parent','ID');
    },
    dealer() {
        return this.hasOne('DealerChamp', 'Champ','ID');
    },
    parse(att){
        if(att.hasOwnProperty('Icon')){
            att.readSvg = null;
            if(att.Icon){
                if(att.Icon.indexOf('.svg') > -1){
                    att.readSvg = fs.readFileSync('public/'+att.Icon).toString('utf8');
                }
            }

            att.Icon =  baseUrl   + att.Icon +'?url';
        }


        return att;
    }



});

Champ.create_table = async () => {
    if (!await knex.schema.hasTable(tables.champ)) {
        await knex.schema.createTable(tables.champ, function (table) {
            table.bigIncrements('ID', {primaryKey: true}).primary();
            table.string('Icon', 255).nullable();
            table.bigInteger('Sport').unsigned().references('ID').inTable(tables.sport).notNullable();
            table.bigInteger('Parent').unsigned().references('ID').inTable(tables.champ).nullable();
            table.enum('Popular', ['0', '1']).defaultTo('0').notNullable();
            table.enum('Status', ['0', '1']).defaultTo('1').notNullable();
            table.string('Banner', 255).nullable();
            table.timestamp('AddDate').defaultTo(knex.fn.now());
            table.timestamp('UpdateDate').defaultTo(knex.fn.now());
        });
    }
};



module.exports = Champ;
