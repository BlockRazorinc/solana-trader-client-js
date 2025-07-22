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

   `npm install`

4. **Edit mode_grpc_fast.js**

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
	const mode = "";

	// tip amount
	const tipAmount  = 1000000;
	```

5. **Run mode_grpc_fast example**
   
   `node mode_grpc_fast.js`

# GRPC

## fast mode

1. **Edit mode_grpc_fast.js**
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
	const mode = "";

	// tip amount
	const tipAmount  = 1000000;
	```
 
2. **Run mode_grpc_fast example**
   
   `node mode_grpc_fast.js`

## sandwichMitigation mode

1. **Edit mode_grpc_sandwichMitigation.js**
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
	const mode = "sandwichMitigation";
	// safeWindow
	const safeWindow = 5;
	// Revert protection
	const revertProtection = false;
	// tip amount
	const tipAmount = 1000000;
	```
 
2. **Run mode_grpc_sandwichMitigation example**
   
   `node mode_grpc_sandwichMitigation.js`


# HTTP

## fast mode

1. **Edit mode_http_fast.js**
    ```
	// BlockRazor relay endpoint address
	const httpEndpoint = "http://frankfurt.solana.blockrazor.xyz:443/sendTransaction";
	const healthEndpoint = "http://frankfurt.solana.blockrazor.xyz:443/health";
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
	const tipAmount = 1000000;
	```
 
2. **Run mode_http_fast example**
   
   `node mode_http_fast.js`

## sandwichMitigation mode

1. **Edit mode_http_sandwichMitigation.js**
    ```
	// BlockRazor relay endpoint address
	const httpEndpoint = "http://frankfurt.solana.blockrazor.xyz:443/sendTransaction";
	const healthEndpoint = "http://frankfurt.solana.blockrazor.xyz:443/health";
	// Replace with your Solana RPC endpoint
	const mainNetRPC = "";
	// Replace with your authKey
	const authKey = "";
	// Replace with your private key (base58)
	const privateKey = "";
	// Replace with your target public key
	const publicKey = "";
	// Send mode
	const mode = "sandwichMitigation";
	// Safe window
	const safeWindow = 5;
	// Revert protection
	const revertProtection = false;
	// Transaction amount
	const amount = 200_000;
	// Tip amount
	const tipAmount = 1000000;
	```
 
2. **Run mode_http_sandwichMitigation example**
   
   `node mode_http_sandwichMitigation.js`