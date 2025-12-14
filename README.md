# LUXITE Mint

A 1:1 token wrapper that converts LSQ (pump.fun token) to LUXITE (Token-2022 with updatable metadata).

```
LSQ (pump.fun)          LUXITE
├─ Immutable       →    ├─ Mutable metadata ✓
├─ Old branding         ├─ New branding
└─ Existing liquidity   └─ Your new token
```

## Project Structure

```
luxite-mint/
├── api/                    # API crate - shared types & constants
│   └── src/
│       ├── consts.rs       # Program constants
│       ├── error.rs        # Custom errors
│       ├── state/          # Account definitions
│       └── lib.rs
├── program/                # Anchor program
│   └── src/
│       ├── instructions/   # Instruction handlers
│       │   ├── initialize.rs
│       │   ├── create_metadata.rs
│       │   ├── wrap.rs
│       │   └── unwrap.rs
│       └── lib.rs
├── cli/                    # Rust CLI tool
│   └── src/main.rs
├── scripts/                # TypeScript scripts
│   ├── initialize.ts
│   ├── wrap.ts
│   ├── unwrap.ts
│   ├── status.ts
│   └── grind-vanity.ts
├── tests/
│   └── luxite-mint.ts
├── Anchor.toml
├── Cargo.toml              # Workspace config
└── package.json
```

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                     LUXITE MINT PROGRAM                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   wrap()                           unwrap()                 │
│   ──────                           ────────                 │
│   LSQ in → LUXITE out              LUXITE in → LSQ out      │
│                                                             │
│                    ┌─────────┐                              │
│                    │  VAULT  │                              │
│                    │  (PDA)  │                              │
│                    └─────────┘                              │
│                    Holds LSQ                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## API

- [`consts`](api/src/consts.rs) – Program constants
- [`error`](api/src/error.rs) – Custom program errors
- [`state`](api/src/state/) – Account definitions

## Instructions

- [`initialize`](program/src/instructions/initialize.rs) – Initialize wrapper
- [`create_metadata`](program/src/instructions/create_metadata.rs) – Create token metadata
- [`wrap`](program/src/instructions/wrap.rs) – Wrap LSQ → LUXITE
- [`unwrap`](program/src/instructions/unwrap.rs) – Unwrap LUXITE → LSQ

## Quick Start

### Prerequisites

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install 0.30.1
avm use 0.30.1
npm install
```

### Build

```bash
anchor build
```

### Test

```bash
anchor test
```

### Deploy

```bash
# Devnet
solana config set --url devnet
anchor deploy --provider.cluster devnet
npm run init:devnet

# Mainnet
solana config set --url mainnet-beta
anchor deploy --provider.cluster mainnet
npm run init:mainnet
```

## Commands

| Command | Description |
|---------|-------------|
| `anchor build` | Build the program |
| `anchor test` | Run tests |
| `npm run grind LUX` | Generate vanity address |
| `npm run init:devnet` | Initialize on devnet |
| `npm run init:mainnet` | Initialize on mainnet |
| `npm run wrap <amount>` | Wrap LSQ → LUXITE |
| `npm run unwrap <amount>` | Unwrap LUXITE → LSQ |
| `npm run status` | Check wrapper status |

## Security

- **Vault is PDA-controlled**: No private key, only program can access
- **1:1 enforced by code**: Can't mint without depositing, can't withdraw without burning
