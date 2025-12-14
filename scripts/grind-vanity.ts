import { Keypair } from "@solana/web3.js";
import * as fs from "fs";

const prefix = process.argv[2]?.toUpperCase() || "LUX";
const outputPath = `./${prefix}-mint.json`;

console.log(`Grinding for address starting with "${prefix}"...`);
console.log("This may take a while...\n");

let attempts = 0;
const startTime = Date.now();

while (true) {
  attempts++;
  const keypair = Keypair.generate();
  const address = keypair.publicKey.toBase58();

  if (attempts % 10000 === 0) {
    const elapsed = (Date.now() - startTime) / 1000;
    const rate = Math.floor(attempts / elapsed);
    console.log(`  ${attempts.toLocaleString()} attempts (${rate}/sec)`);
  }

  if (address.toUpperCase().startsWith(prefix)) {
    console.log(`\nFound after ${attempts.toLocaleString()} attempts!`);
    console.log(`Address: ${address}`);

    fs.writeFileSync(
      outputPath,
      JSON.stringify(Array.from(keypair.secretKey))
    );
    console.log(`Saved to ${outputPath}`);
    break;
  }
}
