use anchor_lang::prelude::*;

#[error_code]
pub enum LuxiteError {
    #[msg("Amount must be greater than zero")]
    ZeroAmount,

    #[msg("Invalid LSQ mint address")]
    InvalidLsqMint,

    #[msg("Invalid LUXITE mint address")]
    InvalidLuxiteMint,

    #[msg("Invalid vault address")]
    InvalidVault,

    #[msg("Unauthorized signer")]
    Unauthorized,
}
