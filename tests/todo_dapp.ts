import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TodoDapp } from "../target/types/todo_dapp";
import { utf8 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { assert, expect } from "chai";


function getTodoPDA(
  programId: anchor.web3.PublicKey,
  provider: anchor.AnchorProvider,
  todo_indx: number
) {
  let todoPDA = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("TODO_ACCOUNT"),
      provider.wallet.publicKey.toBuffer(),
      Buffer.from([todo_indx]),
    ],
    programId
  );
  return todoPDA;
}

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

  let content_todo = "My name is pranaya raj";

  console.log(`The authority wallet addres is ${provider.wallet.publicKey}`);
  console.log(`The PDA for creating User Profile is: ${userPDA.toString()}`);

  it("Initialized User Profile Account!", async () => {
    console.log("Creating User Profile Account.......");
    const trxHash = await program.methods.initializeUser().rpc();

    let { totalTodo, currentTodoIndex } =
      await program.account.userProfile.fetch(userPDA);
    console.log(`Message from initialize user account ${currentTodoIndex}`);
    expect(totalTodo == 0);
    expect(currentTodoIndex == 0);
  });

  it("Created Todo", async () => {
    let userProfile = await program.account.userProfile.fetch(userPDA);

    // Fetch the current todo index
    let currentTodoIndex = userProfile.currentTodoIndex;

    // Generate the PDA for the new todo
    let [todoPDA, _bump] = getTodoPDA(
      program.programId,
      provider,
      currentTodoIndex
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

    console.log(
      `Created todo with index:${currentTodoIndex} and the PDA is ${todoPDA}`
    );
  });

  it("Marked Todo", async () => {
    try {
      let { totalTodo } = await program.account.userProfile.fetch(userPDA);
      let [todoPDA] = getTodoPDA(program.programId, provider, totalTodo - 1);

      let trxSignature = await program.methods
        .markTodo(totalTodo - 1)
        .accountsStrict({
          authority: provider.wallet.publicKey,
          todoAccount: todoPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      console.log(
        `The mark todo transaction is successfull sign: ${trxSignature.toString()}`
      );

      let { markedBool, authority } = await program.account.todoAccount.fetch(
        todoPDA
      );

      assert.equal(markedBool, true);
    } catch (e) {
      console.error(e);
    }
  });
  it("Removed Todo", async () => {
    let { totalTodo } = await program.account.userProfile.fetch(userPDA);
    let todoPDA = getTodoPDA(program.programId, provider, totalTodo - 1)[0];

    await program.methods
      .removeTodo(totalTodo - 1)
      .accountsStrict({
        authority: provider.wallet.publicKey,
        todoAccount: todoPDA,
        userProfile: userPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log(`The Todo of Account: ${todoPDA} is removed!!`);
  });
});

// +++++++++++++++++++++++++++++ Learnings +++++++++++++++++++++++++++
// - for Solana PDAs, the seed should be in little-endian byte format. If you need it in little-endian, you should convert it accordingly.
// - provider.wallet.publicKey.toBuffer(): This returns the public key in big-endian format,
