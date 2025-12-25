use anchor_lang::prelude::*;
use anchor_spl::token::{burn, close_account, Burn, CloseAccount, Mint, Token, TokenAccount};
use luxite_mint_api::prelude::*;

#[derive(Accounts)]
pub struct BurnVault<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [WRAPPER_SEED],
        bump = wrapper_state.bump,
        has_one = authority,
    )]
    pub wrapper_state: Account<'info, WrapperState>,

    #[account(mut, address = wrapper_state.lsq_mint)]
    pub lsq_mint: Account<'info, Mint>,

    #[account(
        mut,
        address = wrapper_state.vault,
        token::mint = lsq_mint,
        token::authority = wrapper_state,
    )]
    pub vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<BurnVault>) -> Result<()> {
    let balance = ctx.accounts.vault.amount;

    // Only proceed if vault has tokens
    require!(balance > 0, LuxiteError::ZeroAmount);

    let seeds = &[WRAPPER_SEED, &[ctx.accounts.wrapper_state.bump]];
    let signer_seeds = &[&seeds[..]];

    // Burn all LSQ in vault
    burn(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                mint: ctx.accounts.lsq_mint.to_account_info(),
                from: ctx.accounts.vault.to_account_info(),
                authority: ctx.accounts.wrapper_state.to_account_info(),
            },
            signer_seeds,
        ),
        balance,
    )?;

    // Close vault account, return rent to authority
    close_account(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            CloseAccount {
                account: ctx.accounts.vault.to_account_info(),
                destination: ctx.accounts.authority.to_account_info(),
                authority: ctx.accounts.wrapper_state.to_account_info(),
            },
            signer_seeds,
        ),
    )?;

    // Clear vault from state
    ctx.accounts.wrapper_state.vault = Pubkey::default();

    Ok(())
}
