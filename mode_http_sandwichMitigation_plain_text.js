const axios = require('axios');
const web3 = require('@solana/web3.js');
const bs58 = require('bs58');
const { getHttpTipAccount } = require('./get_tip_accounts');

// Example endpoints only. Always use the current endpoints published on the BlockRazor website.
const httpEndpoint = "http://frankfurt.solana.blockrazor.xyz:443/v2/sendTransaction";
const healthEndpoint = "http://frankfurt.solana.blockrazor.xyz:443/health";
const tipAccountsEndpoint = "http://frankfurt.solana.blockrazor.xyz:443/getTipAccounts";
const mainNetRPC = '';
const authKey = '';
const privateKey = '';
const publicKey = '';
const mode = 'sandwichMitigation';
const safeWindow = 5;
const revertProtection = false;
const amount = 200_000;
const tipAmount = 100_000;

const httpClient = axios.create({
    timeout: 10000,
    httpAgent: new (require('http').Agent)({ keepAlive: true }),
    httpsAgent: new (require('https').Agent)({ keepAlive: true }),
});

async function pingHealth() {
    const response = await httpClient.post(healthEndpoint, {}, {
        headers: { 'Content-Type': 'application/json', apikey: authKey },
    });
    console.log('Health result:', response.data);
}

async function sendTx() {
    const sender = web3.Keypair.fromSecretKey(new Uint8Array(bs58.decode(privateKey)));
    const receiver = new web3.PublicKey(publicKey);
    const tipAccount = new web3.PublicKey(await getHttpTipAccount(tipAccountsEndpoint));
    const connection = new web3.Connection(mainNetRPC);
    const { blockhash } = await connection.getLatestBlockhash('finalized');
    const transaction = new web3.Transaction()
        .add(web3.SystemProgram.transfer({
            fromPubkey: sender.publicKey,
            toPubkey: tipAccount,
            lamports: tipAmount,
        }))
        .add(web3.SystemProgram.transfer({
            fromPubkey: sender.publicKey,
            toPubkey: receiver,
            lamports: amount,
        }));
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = sender.publicKey;
    transaction.sign(sender);

    const url = new URL(httpEndpoint);
    url.searchParams.set('auth', authKey);
    url.searchParams.set('mode', mode);
    url.searchParams.set('safeWindow', safeWindow.toString());
    url.searchParams.set('revertProtection', revertProtection.toString());
    const response = await httpClient.post(
        url.toString(),
        transaction.serialize().toString('base64'),
        { headers: { 'Content-Type': 'text/plain' } },
    );
    console.log('[send tx] response:', response.data);
}

(async () => {
    await pingHealth();
    setInterval(() => pingHealth().catch(console.error), 30 * 1000);
    await sendTx();
})().catch(console.error);
