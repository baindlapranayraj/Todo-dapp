use anchor_lang::prelude::*;

#[account]
#[derive(Default, InitSpace)]
pub struct UserProfile {
    pub authority: Pubkey,
    pub current_todo_index: u8,
    pub total_todo: u8,
}

#[account]
#[derive(Default, InitSpace)]
pub struct TodoAccount {
    #[max_len(20)]
    pub content: String,
    pub authority: Pubkey,
    pub idx: u8,
    pub marked_bool: bool,
}
