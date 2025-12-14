use luxite_mint_api::prelude::*;
use solana_client::nonblocking::rpc_client::RpcClient;
use solana_sdk::signature::{read_keypair_file, Keypair, Signer};

#[tokio::main]
async fn main() {
    let keypair_path = std::env::var("KEYPAIR").expect("Missing KEYPAIR env var");
    let payer = read_keypair_file(&keypair_path).expect("Failed to read keypair");
    let rpc_url = std::env::var("RPC").expect("Missing RPC env var");
    let rpc = RpcClient::new(rpc_url);

    let cmd = std::env::var("COMMAND").expect("Missing COMMAND env var");
    match cmd.as_str() {
        "status" => log_status(&rpc).await.unwrap(),
        _ => panic!("Invalid command: {}", cmd),
    };
}

async fn log_status(rpc: &RpcClient) -> Result<(), anyhow::Error> {
    let (wrapper_address, _) = wrapper_pda(&luxite_mint_api::ID);
    let account = rpc.get_account(&wrapper_address).await?;
    let state: WrapperState =
        anchor_lang::AccountDeserialize::try_deserialize(&mut account.data.as_slice())?;

    println!("LUXITE Mint Status");
    println!("  Wrapper PDA: {}", wrapper_address);
    println!("  Authority: {}", state.authority);
    println!("  LSQ Mint: {}", state.lsq_mint);
    println!("  LUXITE Mint: {}", state.luxite_mint);
    println!("  Vault: {}", state.vault);
    println!("  Total Wrapped: {}", state.total_wrapped);
    Ok(())
}
