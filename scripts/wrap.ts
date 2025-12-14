import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Connection,
  clusterApiUrl,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import * as fs from "fs";

async function main() {
  const amount = parseInt(process.argv[2]);
  const network = process.argv[3] || "devnet";

  if (!amount || isNaN(amount)) {
    console.error("Usage: npm run wrap <amount> [network]");
    process.exit(1);
  }

  const deployedPath = `./deployed-${network}.json`;
  const deployed = JSON.parse(fs.readFileSync(deployedPath, "utf-8"));

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

  const programId = new PublicKey(deployed.programId);
  const wrapperState = new PublicKey(deployed.wrapperState);
  const luxiteMint = new PublicKey(deployed.luxiteMint);
  const vault = new PublicKey(deployed.vault);
  const lsqMint = new PublicKey(deployed.lsqMint);

  const userLsqAta = await getAssociatedTokenAddress(lsqMint, wallet.publicKey);
  const userLuxiteAta = await getAssociatedTokenAddress(luxiteMint, wallet.publicKey);

  console.log("Wrapping", amount, "LSQ -> LUXITE");

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
    .wrap(new anchor.BN(amount))
    .accounts({
      user: wallet.publicKey,
      wrapperState,
      luxiteMint,
      vault,
      userLsqAta,
      userLuxiteAta,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .signers([wallet])
    .rpc();

  console.log("Wrapped! TX:", tx);
}

main().catch(console.error);
