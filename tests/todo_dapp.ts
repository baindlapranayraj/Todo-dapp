import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TodoDapp } from "../target/types/todo_dapp";
import { utf8 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { createLogger } from "vite";
import { expect } from "chai";
import { BN } from "bn.js";

describe("todo_dapp", () => {
  // Configure the client to use the local cluster.

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TodoDapp as Program<TodoDapp>;
  let encode_user_state = utf8.encode("USER_STATE");

  let [userPDA, _bump] = anchor.web3.PublicKey.findProgramAddressSync(
    [utf8.encode("USER_STATE"), provider.wallet.publicKey.toBuffer()],
    program.programId
  );

  console.log(`The authority wallet addres is ${provider.wallet.publicKey}`);
  console.log(`The PDA for creating User Profile is: ${userPDA.toString()}`);

  it("Initialized User Profile Account!", async () => {
    console.log("Creating User Profile Account.......");
    const trxHash = await program.methods
      .initializeUser()
      .accounts({
        authority: provider.wallet.publicKey,
        userProfile: userPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    let { totalTodo, currentTodoIndex } =
      await program.account.userProfile.fetch(userPDA);
    expect(totalTodo == 0);
    expect(currentTodoIndex == 0);
  });

  it("Created Todo", async () => {
    let userProfile = await program.account.userProfile.fetch(userPDA);

    // Fetch the current todo index
    let currentTodoIndex = userProfile.currentTodoIndex;

    // Generate the PDA for the new todo
    let [todoPDA, _bump] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("TODO_ACCOUNT"),
        provider.wallet.publicKey.toBuffer(),
        Buffer.from([currentTodoIndex]), // Use the current index
      ],
      program.programId
    );

    await program.methods
      .createTodo("New Task") // No need to pass the index explicitly
      .accounts({
        authority: provider.wallet.publicKey,
        userProfile: userPDA,
        todoAccount: todoPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Created todo with index:", currentTodoIndex);
  });

  it("Marked Todo", async () => {
    try {
      // Fetch the user profile account
      let userProfile = await program.account.userProfile.fetch(userPDA);

      // Get the index of the last created todo
      let todoIdx = userProfile.currentTodoIndex - 1;

      // Compute the PDA for the todo using the index
      let [todoPDA, _todoBump] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("TODO_ACCOUNT"),
          provider.wallet.publicKey.toBuffer(),
          Buffer.from([todoIdx]), // Convert index to byte
        ],
        program.programId
      );

      console.log("The TodoPDA to be marked is:", todoPDA.toBase58());

      // Mark the todo
      await program.methods
        .markTodo(todoIdx)
        .accounts({
          authority: provider.wallet.publicKey,
          todoAccount: todoPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      // Fetch the updated todo and verify it is marked
      const { markedBool } = await program.account.todoAccount.fetch(todoPDA);

      expect(markedBool).to.equal(true);
      console.log(`Todo with index ${todoIdx} is marked as completed.`);
    } catch (e) {
      console.error("Error marking todo:", e);
      throw e;
    }
  });
  it("Removed Todo", async () => {
    try {
      // Fetch the user profile account
      let userProfile = await program.account.userProfile.fetch(userPDA);

      // Get the index of the last created todo
      let todoIdx = userProfile.currentTodoIndex - 1;

      // Compute the PDA for the todo using the index
      let [todoPDA, _todoBump] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("TODO_ACCOUNT"),
          provider.wallet.publicKey.toBuffer(),
          Buffer.from([todoIdx]), // Convert index to byte
        ],
        program.programId
      );

      console.log("The TodoPDA to be removed is:", todoPDA.toBase58());

      // Remove the todo
      await program.methods
        .removeTodo(todoIdx)
        .accounts({
          authority: provider.wallet.publicKey,
          todoAccount: todoPDA,
          userProfile: userPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      // Fetch the updated user profile and verify the total todo count is decremented
      const updatedUserProfile = await program.account.userProfile.fetch(
        userPDA
      );

      expect(updatedUserProfile.totalTodo).to.equal(userProfile.totalTodo - 1);
      console.log(`Todo with index ${todoIdx} was removed successfully.`);
    } catch (e) {
      console.error("Error removing todo:", e);
      throw e;
    }
  });
});

// +++++++++++++++++++++++++++++ Learnings +++++++++++++++++++++++++++
// - for Solana PDAs, the seed should be in little-endian byte format. If you need it in little-endian, you should convert it accordingly.
// - provider.wallet.publicKey.toBuffer(): This returns the public key in big-endian format,
// -
