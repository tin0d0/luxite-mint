# LUXITE Mint

A 1:1 token wrapper that converts LSQ (pump.fun token) to LUXITE. Wrapping burns LSQ permanently.
```
LSQ (pump.fun)          LUXITE
├─ No utility      →    ├─ Mining rewards
├─ Old branding         ├─ Staking yields
└─ Burns on wrap        └─ Deflationary
```

## Program Status

- **Program ID:** `77tYCaHwRC8mDJbgBVQLN95P2ATu7UJQn8M8mi4zBq4y`
- **Authority:** None (immutable)
- **Upgrade Authority:** Revoked permanently

## How It Works
```
┌─────────────────────────────────────────────────────────────┐
│                     LUXITE MINT PROGRAM                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   wrap()                                                    │
│   ──────                                                    │
│   1. User sends LSQ                                         │
│   2. LSQ gets BURNED (supply decreases)                     │
│   3. LUXITE minted 1:1 to user                              │
│                                                             │
│   unwrap()                                                  │
│   ────────                                                  │
│   REMOVED - one way only                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
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
│       ├── instructions/
│       │   ├── initialize.rs
│       │   ├── create_metadata.rs
│       │   ├── wrap.rs
│       │   └── burn_vault.rs
│       └── lib.rs
├── cli/                    # Rust CLI tool
├── scripts/                # Deployment scripts
├── Anchor.toml
├── Cargo.toml
└── package.json
```

## Instructions

| Instruction | Description |
|-------------|-------------|
| `initialize` | Initialize wrapper state and LUXITE mint |
| `create_metadata` | Create token metadata for LUXITE |
| `wrap` | Burn LSQ, mint LUXITE 1:1 |
| `burn_vault` | One-time burn of legacy vault LSQ (already executed) |

## Tokenomics

- **LSQ Max Supply:** ~998,248,654 (and decreasing)
- **LUXITE Supply:** Equals total wrapped LSQ
- **Wrap Rate:** 1 LSQ = 1 LUXITE (always)
- **Unwrap:** Not possible (disabled permanently)

Every wrap:
1. Decreases LSQ supply (burned)
2. Increases LUXITE supply (minted)
3. Total value unchanged

## Security

- **Immutable:** Program upgrade authority revoked
- **One-way:** No unwrap, LSQ burns permanently
- **No vault:** LSQ burned directly, not stored
- **Mint authority:** Wrapper PDA only, no admin keys

## Links

- **LUXITE Token:** [LUXvvdZyhKyuRHackWFghcJB3L6DjQH2SAvEjmaksRu](https://solscan.io/token/LUXvvdZyhKyuRHackWFghcJB3L6DjQH2SAvEjmaksRu)
- **LSQ Token:** [Gd4qRUCe3J871r5uVuxv8aUUnDbeT27TGaFjWVnhpump](https://solscan.io/token/Gd4qRUCe3J871r5uVuxv8aUUnDbeT27TGaFjWVnhpump)
- **Program:** [77tYCaHwRC8mDJbgBVQLN95P2ATu7UJQn8M8mi4zBq4y](https://solscan.io/account/77tYCaHwRC8mDJbgBVQLN95P2ATu7UJQn8M8mi4zBq4y)
