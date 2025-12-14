use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke_signed;
use anchor_spl::token::Mint;
use luxite_mint_api::prelude::*;
use mpl_token_metadata::instructions::CreateMetadataAccountV3;
use mpl_token_metadata::types::DataV2;

#[derive(Accounts)]
pub struct CreateTokenMetadata<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        seeds = [WRAPPER_SEED],
        bump = wrapper_state.bump,
        has_one = authority,
    )]
    pub wrapper_state: Account<'info, WrapperState>,

    #[account(address = wrapper_state.luxite_mint)]
    pub luxite_mint: Account<'info, Mint>,

    /// CHECK: Created by metaplex
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,

    /// CHECK: Metaplex program
    #[account(address = mpl_token_metadata::ID)]
    pub token_metadata_program: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CreateTokenMetadata>,
    name: String,
    symbol: String,
    uri: String,
) -> Result<()> {
    let seeds = &[WRAPPER_SEED, &[ctx.accounts.wrapper_state.bump]];
    let signer_seeds = &[&seeds[..]];

    let data = DataV2 {
        name,
        symbol,
        uri,
        seller_fee_basis_points: 0,
        creators: None,
        collection: None,
        uses: None,
    };

    let ix = CreateMetadataAccountV3 {
        metadata: ctx.accounts.metadata.key(),
        mint: ctx.accounts.luxite_mint.key(),
        mint_authority: ctx.accounts.wrapper_state.key(),
        payer: ctx.accounts.authority.key(),
        update_authority: (ctx.accounts.authority.key(), true),
        system_program: ctx.accounts.system_program.key(),
        rent: None,
    };

    let account_infos = vec![
        ctx.accounts.metadata.to_account_info(),
        ctx.accounts.luxite_mint.to_account_info(),
        ctx.accounts.wrapper_state.to_account_info(),
        ctx.accounts.authority.to_account_info(),
        ctx.accounts.authority.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
    ];

    invoke_signed(
        &ix.instruction(
            mpl_token_metadata::instructions::CreateMetadataAccountV3InstructionArgs {
                data,
                is_mutable: true,
                collection_details: None,
            },
        ),
        &account_infos,
        signer_seeds,
    )?;

    Ok(())
}
