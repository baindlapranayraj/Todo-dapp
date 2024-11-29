use anchor_lang::prelude::*;
pub mod constants;
pub mod error;
pub mod state;

#[allow(unused_imports)]
use crate::{constants::*, error::*, state::*};

declare_id!("ExmLEjhb3xa2rj8wraPby9HBYJs34FJyS6MvgJoWX4fS");

#[program]
pub mod todo_dapp {
    use super::*;

    // Initating User Account Profile
    pub fn initialize_user(ctx: Context<InitializeUser>) -> Result<()> {
        let user_profile = &mut ctx.accounts.user_profile;

        user_profile.authority = ctx.accounts.authority.key();
        user_profile.total_todo = 0;
        user_profile.current_todo_index = 0;

        // msg!("The user account is created {:?}", user_profile.authority);
        Ok(())
    }

    // Creates Todo account
    pub fn create_todo(ctx: Context<CreateTodo>, content: String, todo_index: u8) -> Result<()> {
        let todo_account = &mut ctx.accounts.todo_account;
        let user_profile = &mut ctx.accounts.user_profile;

        todo_account.content = content;
        todo_account.idx = todo_index;
        todo_account.marked_bool = false;
        todo_account.authority = ctx.accounts.authority.key();

        let todo_pda = Pubkey::create_program_address(
            &[
                TODO_TAG,
                ctx.accounts.authority.key().as_ref(),
                todo_index.to_le_bytes().as_ref(),
            ],
            ctx.program_id,
        )
        .unwrap();

        msg!("Expected PDA is {:?}", todo_pda);

        // Use the argument passed as an instruction to determine the PDA
        user_profile.total_todo = user_profile.total_todo.checked_add(1).unwrap();
        user_profile.current_todo_index = user_profile.current_todo_index.checked_add(1).unwrap();

        msg!("New Todo is created");
        Ok(())
    }

    // Marks the Todo
    pub fn mark_todo(ctx: Context<MarkeTodo>, _todo_idx: u8) -> Result<()> {
        let todo_account = &mut ctx.accounts.todo_account;
        require!(!todo_account.marked_bool, error::TodoError::AlreadyMarked);
        todo_account.marked_bool = true;

        msg!("This todo is marked as true");

        Ok(())
    }

    // Removes Todo (It actually closes the todo PDA account)
    pub fn remove_todo(ctx: Context<RemoveTodo>, _todo_idx: u8) -> Result<()> {
        let user_profile = &mut ctx.accounts.user_profile;
        user_profile.total_todo = user_profile.total_todo.checked_sub(1).unwrap();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        seeds = [USER_TAG, authority.key().as_ref()],
        bump,
        space = 8 + std::mem::size_of::<UserProfile>()
    )]
    pub user_profile: Box<Account<'info, UserProfile>>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(todo_index: u8)] // Added this to pass the index as an instruction argument
pub struct CreateTodo<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        seeds = [USER_TAG, authority.key().as_ref()],
        bump,
        has_one = authority,
    )]
    pub user_profile: Box<Account<'info, UserProfile>>,

    #[account(
        init,
        payer = authority,
        seeds = [TODO_TAG, authority.key().as_ref(), &todo_index.to_le_bytes()], // Updated to use todo_index argument
        bump,
        space = 8 + TodoAccount::INIT_SPACE
    )]
    pub todo_account: Box<Account<'info, TodoAccount>>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(todo_idx: u8)] // Instruction for marking todo
pub struct MarkeTodo<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        seeds = [TODO_TAG, authority.key().as_ref(), &[todo_idx as u8]],
        bump,
        has_one = authority
    )]
    pub todo_account: Box<Account<'info, TodoAccount>>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(todo_idx: u8)] // Instruction for removing todo
pub struct RemoveTodo<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [USER_TAG, authority.key().as_ref()],
        bump,
        has_one = authority
    )]
    pub user_profile: Account<'info, UserProfile>,

    #[account(
        mut,
        close = authority,
        seeds = [TODO_TAG, authority.key().as_ref(), todo_idx.to_le_bytes().as_ref()],
        bump,
        has_one = authority
    )]
    pub todo_account: Account<'info, TodoAccount>,
    pub system_program: Program<'info, System>,
}

// +++++++++++++++++++++ Learnings ++++++++++++++++++++++++++++
//
// 1. Authority in Seeds:
//    - Including `authority.key().as_ref()` in the seeds ensures that the PDA is tied to the user's public key.
//    - This guarantees that each user has unique PDAs for their `user_profile` or `todo_account`.
//
// 2. Use of as_ref():
//    - Converts values like `Pubkey` or `u8` into byte slices (`&[u8]`), required for PDA seeds.
//    - Example:
//      - `authority.key().as_ref()` converts the `Pubkey` to `[u8; 32]`.
//      - `&[todo_idx]` creates a single-element slice for the `u8` value.
//
// 3. PDA Uniqueness:
//    - Seeds like `[TODO_TAG, authority.key().as_ref(), &[todo_idx].as_ref()]` make PDAs unique
//      per user and per `todo_account`.
//    - This ensures secure and consistent account management.
//
// 4. Account Closing:
//    - The `close = authority` attribute refunds the SOL used for account rent back to the `authority`.
//    - This is crucial for efficient resource management on the Solana blockchain.
//
// 5. Mutability with Accounts:
//    - The `mut` attribute allows modifying account data within a transaction.
//    - For instance:
//      - `user_profile` is updated to increment `current_todo_index` and `total_todo` in `CreateTodo`.
//
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
