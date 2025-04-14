const {
    bookshelf,
    knex,
    tables
} = require('../Database.js');
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
    parentDealer() {
        return this.belongsTo('Users', 'ParentID','ID');
    },
    subDealers() {
        return this.hasMany('Users', 'ParentID','ID').query(qb => {
            qb.where('UserRole', 'sub_dealer');
        });
    },
    users() {
        return this.hasMany('Users', 'ParentID','ID').query(qb => {
            qb.where('UserRole', 'user');
        });
    },
    dealerSports() {
        return this.hasMany('DealerSport', 'DealerID','ID');
    },
    dealerChamps() {
        return this.hasMany('DealerChamp', 'DealerID','ID');
    },
    dealerCountries() {
        return this.hasMany('DealerCountry', 'DealerID','ID');
    },
    dealerEvents() {
        return this.hasMany('DealerEvent', 'DealerID','ID');
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
            table.bigInteger('ParentID').unsigned().references('ID').inTable(tables.user).nullable();
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