import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Connection,
  clusterApiUrl,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as fs from "fs";

const WRAPPER_SEED = Buffer.from("wrapper");

async function main() {
  const network = process.argv[2] || "devnet";
  const configPath = "./config.json";
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

  const endpoint =
    network === "mainnet"
      ? "https://api.mainnet-beta.solana.com"
      : clusterApiUrl("devnet");

  const connection = new Connection(endpoint, "confirmed");

  const walletPath =
    process.env.ANCHOR_WALLET ||
    `${process.env.HOME}/.config/solana/id.json`;
  const wallet = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync(walletPath, "utf-8")))
  );

  const luxiteMintKeypair = Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync(config.vanityKeypairPath, "utf-8")))
  );

  const vaultKeypair = Keypair.generate();

  const programId = new PublicKey(config.programId);
  const lsqMint = new PublicKey(config.lsqMint);

  const [wrapperState] = PublicKey.findProgramAddressSync(
    [WRAPPER_SEED],
    programId
  );

  console.log("Initializing LUXITE Mint...");
  console.log("  Network:", network);
  console.log("  Program ID:", programId.toBase58());
  console.log("  LSQ Mint:", lsqMint.toBase58());
  console.log("  LUXITE Mint:", luxiteMintKeypair.publicKey.toBase58());
  console.log("  Wrapper State:", wrapperState.toBase58());
  console.log("  Vault:", vaultKeypair.publicKey.toBase58());

  const provider = new anchor.AnchorProvider(
    connection,
    new anchor.Wallet(wallet),
    { commitment: "confirmed" }
  );

  const idl = JSON.parse(
    fs.readFileSync("./target/idl/luxite_mint.json", "utf-8")
  );
  const program = new Program(idl, provider);

  const tx = await program.methods
    .initialize()
    .accounts({
      authority: wallet.publicKey,
      wrapperState,
      lsqMint,
      luxiteMint: luxiteMintKeypair.publicKey,
      vault: vaultKeypair.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    })
    .signers([wallet, luxiteMintKeypair, vaultKeypair])
    .rpc();

  console.log("Initialized! TX:", tx);

  const deployedPath = `./deployed-${network}.json`;
  fs.writeFileSync(
    deployedPath,
    JSON.stringify(
      {
        programId: programId.toBase58(),
        wrapperState: wrapperState.toBase58(),
        luxiteMint: luxiteMintKeypair.publicKey.toBase58(),
        vault: vaultKeypair.publicKey.toBase58(),
        lsqMint: lsqMint.toBase58(),
      },
      null,
      2
    )
  );
  console.log("Saved to", deployedPath);
}

main().catch(console.error);
