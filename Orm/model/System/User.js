const {
    bookshelf,
    knex,
    tables
} = require('../../Database.js');
const bcrypt = require('bcrypt');
console.log(bcrypt.hashSync("demo", bcrypt.genSaltSync(10)))
const User = bookshelf.model('Users', {
    tableName: tables.user,
    hidden: ['Password'],

    initialize() {
        this.on('saving', (model, attr, options) => {
            attr.UpdateDate = knex.fn.now();
            if (model.get('Password')) {
                if (model.get('Password').length > 3) {
                    attr.Password = bcrypt.hashSync(model.get('Password'), bcrypt.genSaltSync(10));
                }
            }
        });
    },
    parent_dealer() {
        return this.belongsTo('Users', 'Parent','ID');
    },
    sub_dealers() {
        return this.hasMany('Users', 'Parent','ID').query(qb => {
            qb.where('UserRole', 'sub_dealer');
        });
    },
    users() {
        return this.hasMany('Users', 'Parent','ID').query(qb => {
            qb.where('UserRole', 'user');
        });
    },
    dealer_sports() {
        return this.hasMany('DealerSport', 'Dealer','ID');
    },
    dealer_champs() {
        return this.hasMany('DealerChamp', 'Dealer','ID');
    },
    dealer_events() {
        return this.hasMany('DealerEvent', 'Dealer','ID');
    },
    check_password(password){
        let model = this;
        return new Promise(function (resolve, reject) {
            if(password && model.get('Password')){
                if(!bcrypt.compareSync(password,model.get('Password'))){
                    reject('api.password_wrong');
                }else{
                    resolve(true)
                }
            }else{
                reject('api.password_wrong');
            }
        })
    },
});

User.create_table = async () => {
    if (!await knex.schema.hasTable(tables.user)) {
        await knex.schema.createTable(tables.user, function (table) {
            table.bigIncrements('ID', { primaryKey: true }).primary();
            table.string('Username', 50).index().unique().notNullable();
            table.string('Password', 160).notNullable();
            table.enum('UserRole', ['admin', 'main_dealer', 'sub_dealer', 'user']).defaultTo('user').notNullable();
            table.enum('Status', ['0', '1']).defaultTo('1').notNullable();
            table.bigInteger('Parent').unsigned().references('ID').inTable(tables.user).nullable();
            table.timestamp('AddDate').defaultTo(knex.fn.now());
            table.timestamp('UpdateDate').defaultTo(knex.fn.now());
        });
    }
};

User.prototype.canManageAll = function() {
    return this.get('UserRole') === 'admin';
};

User.prototype.canManageDealers = function() {
    return this.get('UserRole') === 'admin' || this.get('UserRole') === 'main_dealer';
};

User.prototype.canManageUsers = function() {
    return this.get('UserRole') === 'admin' || this.get('UserRole') === 'main_dealer' || this.get('UserRole') === 'sub_dealer';
};

module.exports = User;