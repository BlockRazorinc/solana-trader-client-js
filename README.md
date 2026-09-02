# BlockRazor Solana Transaction Sending — JavaScript Examples

JavaScript examples for sending signed Solana transactions through [BlockRazor](https://blockrazor.io/) over HTTP or gRPC. The repository demonstrates low-latency single-transaction submission, batch submission, and atomic bundles in both Fast and Sandwich Mitigation modes.

> These examples construct and sign transactions locally. Private keys are used only by the local JavaScript process and must never be sent to BlockRazor or committed to source control.

## What this repository covers

| Capability | HTTP | gRPC | Examples in this repository |
| --- | --- | --- | --- |
| Send Transaction | `/sendTransaction`, `/sendBinaryTransaction` | `SendTransaction`, `SendBinaryTransaction` | Base64 and binary; Fast and Sandwich Mitigation |
| Send Batch | `/sendBatch`, `/v2/sendBinaryBatch` | `SendBatch` | Base64 over HTTP/gRPC and raw binary over HTTP |
| Send Bundle | `/sendBundle` | `SendBundle` | Base64 over HTTP/gRPC |
| Keep Alive | `/health` | `GetHealth` | Initial health check and a 30-second health interval |

BlockRazor also provides v2 Plain Text and raw Binary interfaces. This repository currently includes the raw HTTP binary batch example, but it does not include a v2 Plain Text single-transaction example. See the [official Solana Transaction Sending documentation](https://docs.blockrazor.io/transaction-submission/transaction-sending/solana) for every supported interface.

## Fast and Sandwich Mitigation modes

BlockRazor supports two transaction-sending modes:

| Mode | Use it when | Important behavior |
| --- | --- | --- |
| `fast` | Inclusion speed is the main priority | Uses BlockRazor's globally distributed network and SWQoS routing to reach the upcoming Leader with low latency; this is the default mode |
| `sandwichMitigation` | You need additional protection against sandwich attacks | Routes through trusted SWQoS paths and avoids dynamically identified blacklisted Leaders; inclusion may take longer |

Sandwich Mitigation accepts two additional parameters:

- `safeWindow`: number of consecutive allowlisted-validator slots required before sending. The supported range is `3`–`13`; the default is `3`.
- `revertProtection`: when `true`, BlockRazor attempts to prevent the transaction from failing on-chain, which can reduce inclusion speed or prevent inclusion.

Do not use durable nonce transactions with `sandwichMitigation`; doing so makes the sandwich protection ineffective. See [Solana Send Transaction](https://docs.blockrazor.io/transaction-submission/transaction-sending/solana/send-transaction) for the current mode semantics.

## Requirements

- A current Node.js LTS release and npm
- A BlockRazor auth key
- A Solana RPC endpoint for fetching a recent blockhash
- A funded Solana keypair for examples that transfer SOL and pay fees/tips

Obtain an auth key by following [How to Obtain an Auth Token](https://docs.blockrazor.io/get-started/authentication). The default rate limit for transaction and batch sending is documented as 3 TPS; bundle access is not enabled by default. Contact BlockRazor if you need bundle access or a higher limit.

## Quick start

```bash
git clone https://github.com/BlockRazorinc/solana-trader-client-js.git
cd solana-trader-client-js
npm install
```

Open the example you want to run and replace its configuration placeholders:

```js
const mainNetRPC = "YOUR_SOLANA_RPC_ENDPOINT";
const authKey = "YOUR_BLOCKRAZOR_AUTH_KEY";
const privateKey = "YOUR_BASE58_PRIVATE_KEY";
const publicKey = "RECIPIENT_PUBLIC_KEY"; // HTTP transfer examples
```

Each file contains a default Frankfurt endpoint. For production, select the region closest to your application from the current [Solana Transaction Sending endpoint list](https://docs.blockrazor.io/transaction-submission/transaction-sending/solana/endpoint).

> Running an example submits a real mainnet transaction. The examples include a tip transfer and may also include a recipient transfer. Review `tipAmount`, `amount`, the recipient, the selected tip account, and the transaction instructions before running them.

## Example matrix

### Send one transaction

| Transport | Mode | Payload | Command |
| --- | --- | --- | --- |
| gRPC | Fast | Base64 string | `node mode_grpc_fast.js` |
| gRPC | Fast | Protobuf bytes | `node mode_grpc_fast_binary.js` |
| gRPC | Sandwich Mitigation | Base64 string | `node mode_grpc_sandwichMitigation.js` |
| gRPC | Sandwich Mitigation | Protobuf bytes | `node mode_grpc_sandwichMitigation_binary.js` |
| HTTP | Fast | Base64 in JSON | `node mode_http_fast.js` |
| HTTP | Fast | Base64 in the JSON `binaryTransaction` field | `node mode_http_fast_binary.js` |
| HTTP | Sandwich Mitigation | Base64 in JSON | `node mode_http_sandwichMitigation.js` |
| HTTP | Sandwich Mitigation | Base64 in the JSON `binaryTransaction` field | `node mode_http_sandwichMitigation_binary.js` |

The transaction is serialized and signed locally with `@solana/web3.js`. HTTP JSON requests send the serialized bytes as Base64 because JSON cannot carry raw bytes. gRPC `SendBinaryTransaction` passes the serialized `Buffer` directly as Protobuf bytes.

### Send a batch

Batch submission sends multiple signed transactions in one request. A batch can contain up to 25 fully signed transactions, and the response contains a signature or error for each item.

| Transport | Payload | Command |
| --- | --- | --- |
| gRPC | Base64 string array | `node send_batch_grpc.js` |
| HTTP | Base64 string array in JSON | `node send_batch_http.js` |
| HTTP v2 | Length-prefixed raw binary transactions | `node send_batch_http_binary.js` |

The v2 binary batch body is constructed as a sequence of transactions, each prefixed by a two-byte, big-endian length. See [Solana Send Batch](https://docs.blockrazor.io/transaction-submission/transaction-sending/solana/send-batch) and [Send Batch in Binary](https://docs.blockrazor.io/transaction-submission/transaction-sending/solana/send-batch/send-in-binary) for the current contract.

### Send a bundle

A bundle contains up to four fully signed, Base64-encoded transactions. Transactions execute sequentially and atomically: if any transaction fails, the entire bundle fails.

| Transport | Payload | Command |
| --- | --- | --- |
| gRPC | Base64 string array | `node send_bundle_grpc.js` |
| HTTP | Base64 string array in JSON | `node send_bundle_http.js` |

Bundle access is not enabled by default. See [Solana Send Bundle](https://docs.blockrazor.io/transaction-submission/transaction-sending/solana/send-bundle) for activation and MEV-protection guidance.

## Authentication

Authentication depends on the interface:

| Interface | Auth location |
| --- | --- |
| HTTP JSON | `apikey` request header |
| gRPC | `apikey` request metadata |
| HTTP v2 raw binary | `auth` URL query parameter |

Never log auth keys or include them in committed files. Prefer environment variables or a secret manager when adapting these examples for production.

## Transaction encoding

| Interface | Field/body | Encoding |
| --- | --- | --- |
| gRPC `SendTransaction` | `transaction` | Base64 string |
| gRPC `SendBinaryTransaction` | `binaryTransaction` | Raw bytes in Protobuf |
| HTTP `/sendTransaction` | `transaction` | Base64 string in JSON |
| HTTP `/sendBinaryTransaction` | `binaryTransaction` | Base64 string in JSON |
| HTTP `/v2/sendTransaction` | Request body | Base64 text with `Content-Type: text/plain` |
| HTTP `/v2/sendBinaryTransaction` | Request body | Raw serialized bytes with `Content-Type: application/octet-stream` |

The last two v2 single-transaction interfaces are part of the BlockRazor service but do not currently have example files in this repository. Refer to [Send in Plain Text](https://docs.blockrazor.io/transaction-submission/transaction-sending/solana/send-transaction/send-in-plain-text) and [Send in Binary](https://docs.blockrazor.io/transaction-submission/transaction-sending/solana/send-transaction/send-in-binary).

## Priority fee and tip

The examples select a BlockRazor tip account at random and add a tip transfer instruction. Rotating tip accounts helps avoid performance degradation caused by account contention.

The current examples demonstrate the tip transfer but do not add a Compute Budget priority-fee instruction. For production transactions, configure both according to your strategy and the current network conditions. Consult [Solana Transaction Sending Priority Fee & Tip](https://docs.blockrazor.io/transaction-submission/transaction-sending/solana/priority-fee-and-tip) for the current minimums, recommendations, and official tip accounts.

## Keep the connection warm

Every example performs a health request before sending and repeats it every 30 seconds. HTTP clients also enable connection reuse through keep-alive agents. This avoids paying connection-establishment cost on the critical transaction path.

See [Solana Transaction Sending Keep Alive](https://docs.blockrazor.io/transaction-submission/transaction-sending/solana/keep-alive) for the current health endpoint contract.

## gRPC API

The service definition lives in [`server.proto`](server.proto):

```proto
service Server {
  rpc SendTransaction(SendRequest) returns (SendResponse);
  rpc SendBinaryTransaction(SendBinaryRequest) returns (SendResponse);
  rpc SendBatch(SendBatchRequest) returns (SendBatchResponse);
  rpc SendBundle(SendBundleRequest) returns (SendBundleResponse);
  rpc GetHealth(HealthRequest) returns (HealthResponse);
}
```

The JavaScript client loads this definition dynamically with `@grpc/proto-loader` and authenticates by attaching `apikey` metadata.

## Production checklist

- Load the auth key and private key from environment variables or a secret manager.
- Use a dedicated, low-balance wallet while adapting the examples.
- Validate the destination address, transaction instructions, amounts, priority fee, tip, and recent blockhash before signing.
- Select the nearest BlockRazor endpoint and test latency from your own deployment region.
- Reuse HTTP/gRPC connections and keep them warm before the critical send path.
- Add request deadlines, retries appropriate to transaction semantics, structured logging, metrics, and graceful shutdown.
- Do not blindly retry a request without checking its returned signature and on-chain status.
- Do not use durable nonce transactions in Sandwich Mitigation mode.

## Documentation and support

- [Solana Transaction Sending](https://docs.blockrazor.io/transaction-submission/transaction-sending/solana)
- [Endpoints](https://docs.blockrazor.io/transaction-submission/transaction-sending/solana/endpoint)
- [Send Transaction](https://docs.blockrazor.io/transaction-submission/transaction-sending/solana/send-transaction)
- [Send Batch](https://docs.blockrazor.io/transaction-submission/transaction-sending/solana/send-batch)
- [Send Bundle](https://docs.blockrazor.io/transaction-submission/transaction-sending/solana/send-bundle)
- [Priority Fee & Tip](https://docs.blockrazor.io/transaction-submission/transaction-sending/solana/priority-fee-and-tip)
- [Keep Alive](https://docs.blockrazor.io/transaction-submission/transaction-sending/solana/keep-alive)
- [BlockRazor Discord](https://discord.com/invite/qqJuwRb8Nh)
