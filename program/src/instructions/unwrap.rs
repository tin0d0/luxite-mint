use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{burn, transfer, Burn, Mint, Token, TokenAccount, Transfer},
};
use luxite_mint_api::prelude::*;

#[derive(Accounts)]
pub struct Unwrap<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut, seeds = [WRAPPER_SEED], bump = wrapper_state.bump)]
    pub wrapper_state: Account<'info, WrapperState>,

    pub lsq_mint: Account<'info, Mint>,

    #[account(mut, address = wrapper_state.luxite_mint)]
    pub luxite_mint: Account<'info, Mint>,

    #[account(mut, address = wrapper_state.vault)]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = lsq_mint,
        associated_token::authority = user,
    )]
    pub user_lsq_ata: Account<'info, TokenAccount>,

    #[account(mut, token::mint = luxite_mint, token::authority = user)]
    pub user_luxite_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Unwrap>, amount: u64) -> Result<()> {
    require!(amount > 0, LuxiteError::ZeroAmount);

    burn(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                mint: ctx.accounts.luxite_mint.to_account_info(),
                from: ctx.accounts.user_luxite_ata.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        ),
        amount,
    )?;

    let seeds = &[WRAPPER_SEED, &[ctx.accounts.wrapper_state.bump]];
    let signer_seeds = &[&seeds[..]];

    transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.vault.to_account_info(),
                to: ctx.accounts.user_lsq_ata.to_account_info(),
                authority: ctx.accounts.wrapper_state.to_account_info(),
            },
            signer_seeds,
        ),
        amount,
    )?;

    ctx.accounts.wrapper_state.total_wrapped -= amount;
    Ok(())
}
