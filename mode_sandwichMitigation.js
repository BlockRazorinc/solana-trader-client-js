const web3 = require("@solana/web3.js");
const bs58 = require("bs58");

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = __dirname + '/server.proto';
const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    }
);

const serverProto = grpc.loadPackageDefinition(packageDefinition).serverpb;

// BlockRazor relay endpoint address
const blzRelayEndpoint = "frankfurt.solana-grpc.blockrazor.xyz:80";
// replace your solana rpc endpoint
const mainNetRPC = "";
// replace your authKey
const authKey = "";
// relace your private key(base58)
const privateKey = "";
// send mode
const mode = "sandwichMitigation";
// safeWindow
const safeWindow = 5;

// tip amount
const tipAmount = 1000000;

const tipAccounts = [
    "Gywj98ophM7GmkDdaWs4isqZnDdFCW7B46TXmKfvyqSm",
    "FjmZZrFvhnqqb9ThCuMVnENaM3JGVuGWNyCAxRJcFpg9",
    "6No2i3aawzHsjtThw81iq1EXPJN6rh8eSJCLaYZfKDTG",
    "A9cWowVAiHe9pJfKAj3TJiN9VpbzMUq6E4kEvf5mUT22",
];

function getRandomAccount() {
    const randomIndex = Math.floor(Math.random() * tipAccounts.length);
    return tipAccounts[randomIndex];
}

(async () => {
    const client = new serverProto.Server(
        blzRelayEndpoint,
        grpc.credentials.createInsecure()
    );

    var meta = new grpc.Metadata();
    meta.add('apikey', authKey);

    client.getHealth({}, meta, (err, response) => {
        if (err) {
            console.error('[get health] error:', err);
            return;
        }

        console.log('[get health] response:', response);
    });

    const senderPrivateKey = new Uint8Array(bs58.decode(privateKey));
    const senderKeypair = web3.Keypair.fromSecretKey(senderPrivateKey);

    const tipAccount = getRandomAccount();
    const recipientPublicKey = new web3.PublicKey(tipAccount);

    const transaction = new web3.Transaction().add(
        web3.SystemProgram.transfer({
            fromPubkey: senderKeypair.publicKey,
            toPubkey: recipientPublicKey,
            lamports: tipAmount,
        })
    );

    const connection = new web3.Connection(mainNetRPC);

    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.feePayer = senderKeypair.publicKey;
    transaction.sign(senderKeypair);

    const serializedTransaction = transaction.serialize();
    const base64Tx = serializedTransaction.toString('base64');

    client.SendTransaction({ transaction: base64Tx, mode: mode, safeWindow: safeWindow }, meta, (err, response) => {
        if (err) {
            console.error('[send tx] error:', err);
            return;
        }

        console.log('[send tx] response:', response);
    });
})();