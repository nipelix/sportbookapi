const crypto = require('crypto');
const axios = require('axios');
const GetSportsShortZip = require('./GetSportsShortZip');
const Get1x2_VZip = require('./Get1x2_VZip');

/**
 * Makes a request to the Melbet API and processes the response
 * @param {string} url - The full URL to request
 * @returns {Promise<any>} - The processed response data
 */
const request = async (url) => {
    return axios
        .get(url)
        .then(function (data) {
            return data.data;
        })
        .then(function (data) {
            if (data) {
                if (data.Success) {
                    if (data.Value) {
                        if (data.Value.length === 0) {
                            throw Error('Value came empty');
                        } else {
                            return data.Value;
                        }
                    } else {
                        throw Error('Value parameter is missing');
                    }
                } else {
                    throw Error('Returned error');
                }
            } else {
                throw Error('Returned error');
            }
        });
};

/**
 * Generates a unique key based on request parameters
 * @param {string} type - Request type ('line' or 'live')
 * @param {string} page - Page to request
 * @param {Object} params - Additional parameters
 * @returns {string} - MD5 hash of the request parameters
 */
const generateKey = (type, page, params) => {
    const hash = crypto.createHash('md5');

    if (!params || Object.keys(params).length === 0) {
        hash.update(`${type}_${page}`);
    } else {
        const paramKey = Object.entries(params)
            .map(([key, value]) => `${key}_${value}`)
            .join('_');
        hash.update(`${type}_${page}_${paramKey}`);
    }

    return hash.digest('hex');
};

// Valid item types
const ItemType = ['line', 'live'];

// Valid page types
const ItemPage = ['GetGameZip', 'Get1x2_VZip', 'GetSportsShortZip'];

// General interval for requests in milliseconds
const GeneralInterval = 5000;

/**
 * Filters the API response based on the requested page
 * @param {any} response - The raw API response
 * @param {string} page - The requested page
 * @returns {Promise<any>} - The filtered response
 */
const filterResponse = async (response, page) => {
    switch (page) {
        case 'GetGameZip':
            return [];
        case 'Get1x2_VZip':
            return Get1x2_VZip(response);
        case 'GetSportsShortZip':
            return await GetSportsShortZip(response);
        default:
            throw Error('Not Found Page Function');
    }
};

module.exports = {
    request,
    generateKey,
    ItemType,
    ItemPage,
    GeneralInterval,
    filterResponse
};