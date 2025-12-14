import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { expect } from "chai";

describe("luxite-mint", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.LuxiteMint as Program;

  const WRAPPER_SEED = Buffer.from("wrapper");

  let lsqMint: PublicKey;
  let luxiteMint: Keypair;
  let vault: Keypair;
  let wrapperState: PublicKey;
  let userLsqAta: PublicKey;
  let userLuxiteAta: PublicKey;

  before(async () => {
    lsqMint = await createMint(
      provider.connection,
      (provider.wallet as anchor.Wallet).payer,
      provider.publicKey,
      null,
      6
    );

    luxiteMint = Keypair.generate();
    vault = Keypair.generate();

    [wrapperState] = PublicKey.findProgramAddressSync(
      [WRAPPER_SEED],
      program.programId
    );

    const ata = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      (provider.wallet as anchor.Wallet).payer,
      lsqMint,
      provider.publicKey
    );
    userLsqAta = ata.address;

    await mintTo(
      provider.connection,
      (provider.wallet as anchor.Wallet).payer,
      lsqMint,
      userLsqAta,
      provider.publicKey,
      1_000_000_000
    );
  });

  it("initializes", async () => {
    await program.methods
      .initialize()
      .accounts({
        authority: provider.publicKey,
        wrapperState,
        lsqMint,
        luxiteMint: luxiteMint.publicKey,
        vault: vault.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([luxiteMint, vault])
      .rpc();

    const state = await program.account.wrapperState.fetch(wrapperState);
    expect(state.authority.toBase58()).to.equal(provider.publicKey.toBase58());
    expect(state.lsqMint.toBase58()).to.equal(lsqMint.toBase58());
    expect(state.totalWrapped.toNumber()).to.equal(0);
  });

  it("wraps LSQ to LUXITE", async () => {
    const ata = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      (provider.wallet as anchor.Wallet).payer,
      luxiteMint.publicKey,
      provider.publicKey
    );
    userLuxiteAta = ata.address;

    const amount = new anchor.BN(100_000_000);

    await program.methods
      .wrap(amount)
      .accounts({
        user: provider.publicKey,
        wrapperState,
        luxiteMint: luxiteMint.publicKey,
        vault: vault.publicKey,
        userLsqAta,
        userLuxiteAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const state = await program.account.wrapperState.fetch(wrapperState);
    expect(state.totalWrapped.toNumber()).to.equal(100_000_000);
  });

  it("unwraps LUXITE to LSQ", async () => {
    const amount = new anchor.BN(50_000_000);

    await program.methods
      .unwrap(amount)
      .accounts({
        user: provider.publicKey,
        wrapperState,
        lsqMint,
        luxiteMint: luxiteMint.publicKey,
        vault: vault.publicKey,
        userLsqAta,
        userLuxiteAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const state = await program.account.wrapperState.fetch(wrapperState);
    expect(state.totalWrapped.toNumber()).to.equal(50_000_000);
  });

  it("rejects zero amount wrap", async () => {
    try {
      await program.methods
        .wrap(new anchor.BN(0))
        .accounts({
          user: provider.publicKey,
          wrapperState,
          luxiteMint: luxiteMint.publicKey,
          vault: vault.publicKey,
          userLsqAta,
          userLuxiteAta,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      expect.fail("Should have thrown");
    } catch (e) {
      expect(e.message).to.include("ZeroAmount");
    }
  });
});
