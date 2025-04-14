const { database } = require('../config.js');
const knex = require('knex')(database)
const bookshelf = require('bookshelf')(knex);

const tables = {
    sport: 'sports',
    sport_mapping: 'sport_mapping',
    dealer_sport: 'dealer_sport',
    user: 'user',
    country: 'country',
    dealer_country: 'dealer_country',
    champ: 'champs',
    champ_mapping: 'champ_mapping',
    dealer_champ: 'dealer_champ',
    event: 'events',
    event_category: 'event_category',
    event_group: 'event_group',
    event_mapping: 'event_mapping',
    dealer_event: 'dealer_event',
    team: 'team',
    team_mapping: 'team_mapping',
    dealer_team: 'dealer_team',
    credit: 'credit',
    balance: 'balance',
    favorite: 'favorite'
}

module.exports = {
    knex,
    bookshelf,
    tables
}