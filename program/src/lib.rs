use anchor_lang::prelude::*;

mod instructions;

use instructions::*;
use luxite_mint_api::prelude::*;
use solana_security_txt::security_txt;

declare_id!("77tYCaHwRC8mDJbgBVQLN95P2ATu7UJQn8M8mi4zBq4y");

security_txt! {
    name: "LUXITE Mint",
    project_url: "https://localuniverse.io",
    contacts: "email:tino@localuniverse.io",
    policy: "https://github.com/tin0d0/luxite-mint/blob/main/SECURITY.md",
    preferred_languages: "en",
    source_code: "https://github.com/tin0d0/luxite-mint"
}

#[program]
pub mod luxite_mint {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        instructions::initialize::handler(ctx)
    }

    pub fn create_metadata(
        ctx: Context<CreateTokenMetadata>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        instructions::create_metadata::handler(ctx, name, symbol, uri)
    }

    pub fn wrap(ctx: Context<Wrap>, amount: u64) -> Result<()> {
        instructions::wrap::handler(ctx, amount)
    }

    pub fn unwrap(ctx: Context<Unwrap>, amount: u64) -> Result<()> {
        instructions::unwrap::handler(ctx, amount)
    }
}
