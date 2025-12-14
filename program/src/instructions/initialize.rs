use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use luxite_mint_api::prelude::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = WrapperState::LEN,
        seeds = [WRAPPER_SEED],
        bump
    )]
    pub wrapper_state: Account<'info, WrapperState>,

    pub lsq_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = authority,
        mint::decimals = TOKEN_DECIMALS,
        mint::authority = wrapper_state,
    )]
    pub luxite_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = authority,
        token::mint = lsq_mint,
        token::authority = wrapper_state,
    )]
    pub vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<Initialize>) -> Result<()> {
    let state = &mut ctx.accounts.wrapper_state;
    state.authority = ctx.accounts.authority.key();
    state.lsq_mint = ctx.accounts.lsq_mint.key();
    state.luxite_mint = ctx.accounts.luxite_mint.key();
    state.vault = ctx.accounts.vault.key();
    state.bump = ctx.bumps.wrapper_state;
    state.total_wrapped = 0;
    Ok(())
}
