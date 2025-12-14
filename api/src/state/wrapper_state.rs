use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct WrapperState {
    pub authority: Pubkey,
    pub lsq_mint: Pubkey,
    pub luxite_mint: Pubkey,
    pub vault: Pubkey,
    pub bump: u8,
    pub total_wrapped: u64,
}

impl WrapperState {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 32 + 1 + 8;
}
