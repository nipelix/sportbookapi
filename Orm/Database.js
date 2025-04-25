const { database } = require('../config.js');
const knex = require('knex')(database)
const bookshelf = require('bookshelf')(knex);

const tables = {
    language: 'language',
    user: 'user',
    coupon: 'coupon',
    coupon_event: 'coupon_event',
    favorite: 'favorite',


    //Sports
    sport: 'sports',
    sport_meta: 'sports_meta',
    sport_mapping: 'sport_mapping',
    sport_dealer: 'sport_dealer',
    //Champs
    champ: 'champs',
    champ_mapping: 'champ_mapping',
    champ_dealer: 'champ_dealer',
    champ_meta: 'champ_meta',
    // Statics
    statics: 'statics',
    statics_mapping: 'statics_mapping',
    statics_meta: 'statics_meta',

    //Event Category
    category: 'category',
    category_meta: 'category_meta',

    // Event group
    group_dealer: 'group_dealer',
    group_meta: 'group_meta',
    group:  'group',





    country: 'country',
    dealer_country: 'dealer_country',
    event: 'events',
    event_group_meta: 'event_group_meta',
    event_meta: 'event_meta',
    event_group: 'event_group',
    event_mapping: 'event_mapping',
    dealer_event: 'dealer_event',
    team: 'team',
    team_mapping: 'team_mapping',
    dealer_team: 'dealer_team',
    credit: 'credit',
    balance: 'balance',


}

module.exports = {
    knex,
    bookshelf,
    tables
}