const axios = require('axios');
const web3 = require('@solana/web3.js');
const bs58 = require('bs58');

// ------------------ Configuration Constants ------------------
// BlockRazor relay endpoint address
const httpEndpoint = "http://frankfurt.solana.blockrazor.xyz:443/v2/sendBinaryBatch";
const healthEndpoint = "http://frankfurt.solana.blockrazor.xyz:443/v2/health";
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
// Safe window
const safeWindow = 5;
// Revert protection
const revertProtection = false;
// Transaction amount
const amount = 200_000;
// Tip amount
const tipAmount = 1000000;

const tipAccounts = [
		"Gywj98ophM7GmkDdaWs4isqZnDdFCW7B46TXmKfvyqSm",
		"FjmZZrFvhnqqb9ThCuMVnENaM3JGVuGWNyCAxRJcFpg9",
		"6No2i3aawzHsjtThw81iq1EXPJN6rh8eSJCLaYZfKDTG",
		"A9cWowVAiHe9pJfKAj3TJiN9VpbzMUq6E4kEvf5mUT22",
		"68Pwb4jS7eZATjDfhmTXgRJjCiZmw1L7Huy4HNpnxJ3o",
		"4ABhJh5rZPjv63RBJBuyWzBK3g9gWMUQdTZP2kiW31V9",
		"B2M4NG5eyZp5SBQrSdtemzk5TqVuaWGQnowGaCBt8GyM",
		"5jA59cXMKQqZAVdtopv8q3yyw9SYfiE3vUCbt7p8MfVf",
		"5YktoWygr1Bp9wiS1xtMtUki1PeYuuzuCF98tqwYxf61",
		"295Avbam4qGShBYK7E9H5Ldew4B3WyJGmgmXfiWdeeyV",
		"EDi4rSy2LZgKJX74mbLTFk4mxoTgT6F7HxxzG2HBAFyK",
		"BnGKHAC386n4Qmv9xtpBVbRaUTKixjBe3oagkPFKtoy6",
		"Dd7K2Fp7AtoN8xCghKDRmyqr5U169t48Tw5fEd3wT9mq",
		"AP6qExwrbRgBAVaehg4b5xHENX815sMabtBzUzVB4v8S",
];

// ------------------ Axios HTTP Client (Connection Reuse Enabled) ------------------
const httpClient = axios.create({
		timeout: 10000,
		headers: {
				'Content-Type': 'application/octet-stream',
		},
		httpAgent: new (require('http').Agent)({ keepAlive: true }),
		httpsAgent: new (require('https').Agent)({ keepAlive: true }),
});

// ------------------ Periodic Health Ping to Keep Connection Alive ------------------
async function pingHealth() {
		try {
				const url = new URL(healthEndpoint);
				url.searchParams.set("auth", authKey);
				const fullEndpoint = url.toString();
				const res = await httpClient.get(fullEndpoint);
				console.log(`Health result:`, res.data);
		} catch (err) {
				console.error('Health check failed:', err.message);
		}
}

function buildBinaryBatchBody(serializedTxs) {
  const parts = [];

  for (let i = 0; i < serializedTxs.length; i++) {
    const txBytes = Buffer.from(serializedTxs[i]);

    if (txBytes.length > 65535) {
      throw new Error(`tx[${i}] too large: ${txBytes.length} bytes`);
    }

    const lenBuf = Buffer.alloc(2);
    lenBuf.writeUInt16BE(txBytes.length, 0);

    parts.push(lenBuf);
    parts.push(txBytes);
  }

  return Buffer.concat(parts);
}

// ------------------ Build and Send Binary Batch ------------------
async function sendBinaryBatch() {
		const senderPrivateKey = new Uint8Array(bs58.decode(privateKey));
		const senderKeypair = web3.Keypair.fromSecretKey(senderPrivateKey);
		const receiver = new web3.PublicKey(publicKey);
		const tipAccount = new web3.PublicKey(tipAccounts[Math.floor(Math.random() * tipAccounts.length)]);

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

		const serializedTxs = [];
		serializedTxs.push(serialized);
		const binaryBody = buildBinaryBatchBody(serializedTxs);

		const url = new URL(httpEndpoint);
		url.searchParams.set("auth", authKey);
		url.searchParams.set("mode", mode);
		url.searchParams.set("safeWindow", safeWindow);
		url.searchParams.set("revertProtection", revertProtection);

		const fullEndpoint = url.toString();
		
		try {
				const res = await httpClient.post(fullEndpoint, binaryBody);
				console.log('[send binary batch] response:', res.data);
		} catch (err) {
				console.error('sendBinaryBatch failed:', err.response?.data || err.message);
		}
}

// ------------------ Main Entry ------------------
(async () => {
		// Initial health check (establish connection)
		await pingHealth();

		// Periodically send /health to keep connection alive
		setInterval(pingHealth, 30 * 1000);
		sendBinaryBatch().catch(console.error);
})();