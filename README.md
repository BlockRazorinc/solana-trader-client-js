# Solana-trader-client-js
example for solana-trader-client in Javascript

# Document
see [document](https://blockrazor.gitbook.io/blockrazor/solana/send-transaction/js)

# Quickstart

1. **Download git repository**

   `git clone https://github.com/BlockRazorinc/solana-trader-client-js.git`

2. **Change directory**

   `cd solana-trader-client-js`

3. **Download dependencies**

   `npm install @grpc/grpc-js @grpc/proto-loader`

1. **Edit client.js**

	```
	// BlockRazor relay endpoint address
	const blzRelayEndpoint = "frankfurt.solana-grpc.blockrazor.xyz:80";
	// replace your solana rpc endpoint
	const mainNetRPC = "";
	// replace your authKey
	const authKey = "";
	// relace your private key(base58)
	const privateKey = "";
	// send mode
	const mode = "fast";

	// tip amount
	const tipAmount  = 1000000;
	```

2. **Run example**
   
   `node client.js`
