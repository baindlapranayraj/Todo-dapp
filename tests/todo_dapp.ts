import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TodoDapp } from "../target/types/todo_dapp";
import { utf8 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { createLogger } from "vite";
import { expect } from "chai";

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
    try {
      let user_profile_account = await program.account.userProfile.fetch(
        userPDA
      );
      // console.log(user_profile_account);
      // let arr = Buffer.from(user_profile_account.currentTodoIndex.toString());

      let uint8Array = new Uint8Array([user_profile_account.currentTodoIndex]);

      let [todoPDA, _bump] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("TODO_ACCOUNT"),
          provider.wallet.publicKey.toBuffer(),
          uint8Array,
        ],
        program.programId
      );

      console.log("The TodoPDA is:", todoPDA.toBase58());

      let content_todo = "My name is pranaya raj";

      let trxHash = await program.methods
        .createTodo(content_todo, user_profile_account.currentTodoIndex)
        .accounts({
          authority: provider.wallet.publicKey,
          todoAccount: todoPDA,
          userProfile: userPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      let { content, idx, markedBool } =
        await program.account.todoAccount.fetch(todoPDA);

      expect(content).to.equal(content_todo);
      expect(idx).to.equal(user_profile_account.currentTodoIndex);
      expect(markedBool).to.equal(false);
    } catch (e) {
      // console.log(`The occured error is : ${e}`);
      throw e;
    }
  });

  it("Marked Todo", async () => {});
  it("Removed Todo", async () => {});
});
