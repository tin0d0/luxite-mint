pub mod consts;
pub mod error;
pub mod state;

pub mod prelude {
    pub use crate::consts::*;
    pub use crate::error::*;
    pub use crate::state::*;
}

use anchor_lang::prelude::*;

declare_id!("77tYCaHwRC8mDJbgBVQLN95P2ATu7UJQn8M8mi4zBq4y");
