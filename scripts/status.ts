import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { getMint, getAccount } from "@solana/spl-token";
import * as fs from "fs";

async function main() {
  const network = process.argv[2] || "devnet";
  const deployedPath = `./deployed-${network}.json`;

  if (!fs.existsSync(deployedPath)) {
    console.error(`No deployment found at ${deployedPath}`);
    process.exit(1);
  }

  const deployed = JSON.parse(fs.readFileSync(deployedPath, "utf-8"));

  const endpoint =
    network === "mainnet"
      ? "https://api.mainnet-beta.solana.com"
      : clusterApiUrl("devnet");

  const connection = new Connection(endpoint, "confirmed");

  const luxiteMint = new PublicKey(deployed.luxiteMint);
  const vault = new PublicKey(deployed.vault);

  const mintInfo = await getMint(connection, luxiteMint);
  const vaultInfo = await getAccount(connection, vault);

  console.log("\nLUXITE Mint Status");
  console.log("==================");
  console.log("Network:", network);
  console.log("\nAddresses:");
  console.log("  Program ID:", deployed.programId);
  console.log("  Wrapper State:", deployed.wrapperState);
  console.log("  LUXITE Mint:", deployed.luxiteMint);
  console.log("  LSQ Mint:", deployed.lsqMint);
  console.log("  Vault:", deployed.vault);
  console.log("\nStats:");
  console.log("  LUXITE Supply:", mintInfo.supply.toString());
  console.log("  Vault Balance:", vaultInfo.amount.toString());
  console.log("  Decimals:", mintInfo.decimals);
}

main().catch(console.error);
