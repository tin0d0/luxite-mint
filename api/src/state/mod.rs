mod wrapper_state;

pub use wrapper_state::*;

use crate::consts::WRAPPER_SEED;
use anchor_lang::prelude::*;

pub fn wrapper_pda(program_id: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[WRAPPER_SEED], program_id)
}
