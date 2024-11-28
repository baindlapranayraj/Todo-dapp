use anchor_lang::prelude::*;

#[error_code]
pub enum TodoError {
    #[msg("You have already marked this todo")]
    AlreadyMarked,
}
