const axios = require('axios');
const web3 = require('@solana/web3.js');
const bs58 = require('bs58');
const { getHttpTipAccount } = require('./get_tip_accounts');

// ------------------ Configuration Constants ------------------
// Example endpoints only. Always use the current endpoints published on the BlockRazor website.
const httpEndpoint = "http://frankfurt.solana.blockrazor.xyz:443/v2/sendBinaryTransaction";
const healthEndpoint = "http://frankfurt.solana.blockrazor.xyz:443/health";
const tipAccountsEndpoint = "http://frankfurt.solana.blockrazor.xyz:443/getTipAccounts";
// Replace with your Solana RPC endpoint
const mainNetRPC = "";
// Replace with your authKey
const authKey = "";
// Replace with your private key (base58)
const privateKey = "";
// Replace with your target public key
const publicKey = "";
// Send mode
const mode = "fast";
// Transaction amount
const amount = 200_000;
// Tip amount
const tipAmount = 100_000;

// ------------------ Axios HTTP Client (Connection Reuse Enabled) ------------------
const httpClient = axios.create({
    timeout: 10000,
    httpAgent: new (require('http').Agent)({ keepAlive: true }),
    httpsAgent: new (require('https').Agent)({ keepAlive: true }),
});

// ------------------ Periodic Health Ping to Keep Connection Alive ------------------
async function pingHealth() {
    try {
        const res = await httpClient.post(healthEndpoint, {}, {
            headers: { 'Content-Type': 'application/json', apikey: authKey },
        });
        console.log(`Health result:`, res.data);
    } catch (err) {
        console.error('Health check failed:', err.message);
    }
}

// ------------------ Build and Send Transaction ------------------
async function sendTx() {
    const senderPrivateKey = new Uint8Array(bs58.decode(privateKey));
    const senderKeypair = web3.Keypair.fromSecretKey(senderPrivateKey);
    const receiver = new web3.PublicKey(publicKey);
    const tipAccount = new web3.PublicKey(await getHttpTipAccount(tipAccountsEndpoint));

    const connection = new web3.Connection(mainNetRPC);
    const { blockhash } = await connection.getLatestBlockhash('finalized');

    const tx = new web3.Transaction()
        .add(web3.SystemProgram.transfer({
            fromPubkey: senderKeypair.publicKey,
            toPubkey: tipAccount,
            lamports: tipAmount,
        }))
        .add(web3.SystemProgram.transfer({
            fromPubkey: senderKeypair.publicKey,
            toPubkey: receiver,
            lamports: amount,
        }));

    tx.recentBlockhash = blockhash;
    tx.feePayer = senderKeypair.publicKey;
    tx.sign(senderKeypair);

    const serialized = tx.serialize();

    try {
        const url = new URL(httpEndpoint);
        url.searchParams.set('auth', authKey);
        url.searchParams.set('mode', mode);
        const res = await httpClient.post(url.toString(), serialized, {
            headers: {
                'Content-Type': 'application/octet-stream',
            },
            responseType: 'text',
        });
        const signature = res.data.trim();
        if (!signature) {
            throw new Error('send transaction returned an empty signature');
        }
        console.log('[send tx] signature:', signature);
    } catch (err) {
        console.error('SendTx failed:', err.response?.data || err.message);
    }
}

// ------------------ Main Entry ------------------
(async () => {
    // Initial health check (establish connection)
    await pingHealth();

    // Periodically send /health to keep connection alive
    setInterval(pingHealth, 30 * 1000);
    sendTx().catch(console.error);
})();
