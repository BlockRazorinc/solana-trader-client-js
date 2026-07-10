# Solana-trader-client-js

Example for solana-trader-client in JavaScript.

# Document

See [document](https://blockrazor.gitbook.io/blockrazor/solana/send-transaction/js).

# Transaction Encoding

| Encoding | gRPC Method | HTTP Endpoint | Request Field |
|---|---|---|---|
| Base64 | `SendTransaction` | `/sendTransaction` | `transaction` |
| Binary | `SendBinaryTransaction` | `/sendBinaryTransaction` | `binaryTransaction` |

For gRPC Binary requests, pass the serialized transaction `Buffer` directly.
For HTTP Binary requests, convert the serialized transaction to Base64 because
the request body is JSON.

# Quickstart

```bash
git clone https://github.com/BlockRazorinc/solana-trader-client-js.git
cd solana-trader-client-js
npm install
```

# gRPC

## Send Transaction

| Mode | Encoding | Example |
|---|---|---|
| fast | Base64 | `node mode_grpc_fast.js` |
| fast | Binary | `node mode_grpc_fast_binary.js` |
| sandwichMitigation | Base64 | `node mode_grpc_sandwichMitigation.js` |
| sandwichMitigation | Binary | `node mode_grpc_sandwichMitigation_binary.js` |

## Send Bundle

| Encoding | Example |
|---|---|
| Base64 | `node send_bundle_grpc.js` |

## Send Batch

| Encoding | Example |
|---|---|
| Base64 | `node send_batch_grpc.js` |

# HTTP

## Send Transaction

| Mode | Encoding | Example |
|---|---|---|
| fast | Base64 | `node mode_http_fast.js` |
| fast | Binary | `node mode_http_fast_binary.js` |
| sandwichMitigation | Base64 | `node mode_http_sandwichMitigation.js` |
| sandwichMitigation | Binary | `node mode_http_sandwichMitigation_binary.js` |

## Send Bundle

| Encoding | Example |
|---|---|
| Base64 | `node send_bundle_http.js` |

## Send Batch

| Encoding | Example |
|---|---|
| Base64 | `node send_batch_http.js` |

## Send Batch with Binary

| Encoding | Example |
|---|---|
| binary | `node send_batch_http_binary.js` |