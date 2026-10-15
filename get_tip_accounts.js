const axios = require('axios');

// Shared helpers for the getTipAccounts HTTP and gRPC APIs.

async function getHttpTipAccount(endpoint) {
    const response = await axios.get(endpoint, { timeout: 10000 });
    return randomTipAccount(response.data.tipAccounts);
}

function getGrpcTipAccount(client) {
    return new Promise((resolve, reject) => {
        client.getTipAccounts({}, (error, response) => {
            if (error) {
                reject(error);
                return;
            }
            try {
                resolve(randomTipAccount(response.tipAccounts));
            } catch (selectionError) {
                reject(selectionError);
            }
        });
    });
}

function randomTipAccount(accounts) {
    if (!Array.isArray(accounts) || accounts.length === 0) {
        throw new Error('getTipAccounts returned an empty account list');
    }
    return accounts[Math.floor(Math.random() * accounts.length)];
}

module.exports = {
    getGrpcTipAccount,
    getHttpTipAccount,
};
