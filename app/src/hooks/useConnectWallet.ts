import { AnchorProvider, Program, setProvider, web3 } from "@coral-xyz/anchor";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { useEffect, useMemo, useState } from "react";
import idl from "../constants/idl.json";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { TodoDapp } from "../constants/todo_dapp";
import { TodoAccountType } from "../types/programTypes";
import { Bounce, toast } from "react-toastify";
import {Buffer} from 'buffer'


const useConnectWallet = () => {

  // const connection = new web3.Connection("https://withered-thrumming-sailboat.solana-devnet.quiknode.pro/924c4fd3bd6302c1c3e15c051881a547e4513b51")

  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const anchorWallet = useAnchorWallet();

  const [userInitiated, setUserInitiated] = useState(false);
  const [currentTodo, setCurrentTodo] = useState(0);
  const [todos, setTodo] = useState<TodoAccountType>([]);
  const [trxPending, setTrxPending] = useState(false);
  const [loading, setLoading] = useState(false);

  const program: Program<TodoDapp> | null = useMemo(() => {
    if (anchorWallet) {
      const provider = new AnchorProvider(
        connection,
        anchorWallet,
        AnchorProvider.defaultOptions()
      );
      setProvider(provider);

      return new Program<TodoDapp>(idl as any, provider);
    } else {
      return null;
    }
  }, [connection, anchorWallet]);

  useEffect(() => {
    const findProfileAccount = async () => {
      console.log("UseEffect in useConnection wallet is working")
      if (publicKey && program && !trxPending) {
        try {
          setLoading(true);
          // Initiating the Profile PDA
          const [profilePDA, _profileBump] = PublicKey.findProgramAddressSync(
            [Buffer.from("USER_STATE"), publicKey.toBuffer()],
            program.programId
          );
          const userProfileAccount = await program.account.userProfile.fetch(
            profilePDA
          );

          if (userProfileAccount) {
            setCurrentTodo(userProfileAccount.currentTodoIndex);

            const todoAccounts = await program.account.todoAccount.all([]);
            setTodo(todoAccounts);
            setUserInitiated(true);
            console.log(todoAccounts,todos)
          } else {
            setUserInitiated(false);
          }
        } catch (error) {
          setUserInitiated(false);
          console.log(error);
        } finally {
          setLoading(false);
        }
      }
    };
    findProfileAccount();
  }, [publicKey, program, trxPending]);

  const initializeUser = async () => {
    console.log(publicKey)
    if (program && publicKey) {
      try {
        setTrxPending(true);

        //Fetch the user profilePDA
        const userPDA = PublicKey.findProgramAddressSync(
          [Buffer.from("USER_STATE"), publicKey.toBuffer()],
          program.programId
        )[0];

        const trxSignature = await program.methods
          .initializeUser()
          .accountsStrict({
            authority: publicKey,
            systemProgram: SystemProgram.programId,
            userProfile: userPDA,
          })
          .rpc();
        setUserInitiated(true);
        console.log(`Successfully initialized user ${userPDA.toBase58()}`);
        console.log(`For createing userPDA trx sign is : ${trxSignature}`);
        return true;
      } catch (error) {
        toast.error("Error Occured while creating your user profile");
        console.log(`Error while initiating user profile ${error}`);
        return false;
      } finally {
        setTrxPending(false);
        return false;
      }
    }
    return false;
  };

  const addTodo = async (content: string) => {
    if (publicKey && program) {
      try {
        setTrxPending(true);
        const userProfilePDA = PublicKey.findProgramAddressSync(
          [Buffer.from("USER_STATE"), publicKey.toBuffer()],
          program.programId
        )[0];

        // const userProfileAccount = await program.account.userProfile.fetch(userProfilePDA);

        const todoAccountPDA = PublicKey.findProgramAddressSync(
          [
            Buffer.from("TODO_ACCOUNT"),
            publicKey.toBuffer(),
            Buffer.from([currentTodo]),
          ],
          program.programId
        )[0];

        await program.methods
          .createTodo(content)
          .accountsStrict({
            authority: publicKey,
            systemProgram: SystemProgram.programId,
            userProfile: userProfilePDA,
            todoAccount: todoAccountPDA,
          })
          .rpc();

        toast(`Successfully Created Your Todo`, {
          position: "bottom-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Bounce,
        });
        setTrxPending(false);
      } catch (error) {
        console.log(error);
        toast.error("Error Occured while creating Todo");
      } finally {
        setTrxPending(false);
      }
    }
  };

  const markTodo = async (id: number) => {
    if (program && publicKey) {
      try {
        setTrxPending(true);
        setLoading(true);

        const todoPDA = PublicKey.findProgramAddressSync(
          [
            Buffer.from("TODO_ACCOUNT"),
            publicKey.toBuffer(),
            Buffer.from([id]),
          ],
          program.programId
        )[0];

        await program.methods
          .markTodo(id)
          .accountsStrict({
            authority: publicKey,
            systemProgram: SystemProgram.programId,
            todoAccount: todoPDA,
          })
          .rpc();
        setTrxPending(false);
        toast(`Successfully Marked Your Todo`, {
          position: "bottom-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Bounce,
        });
      } catch (error) {
        console.log(error);
        toast.error("Error Occured while marking Todo");
      } finally {
        setTrxPending(false);
        setLoading(false);
      }
    }
  };

  const removeTodo = async (id: number) => {
    if (program && publicKey) {
      try {
        setTrxPending(true);
        setLoading(true);

        const todoPDA = PublicKey.findProgramAddressSync(
          [
            Buffer.from("TODO_ACCOUNT"),
            publicKey.toBuffer(),
            Buffer.from([id]),
          ],
          program.programId
        )[0];

        const userPDA = PublicKey.findProgramAddressSync(
          [Buffer.from("USER_STATE"), publicKey.toBuffer()],
          program.programId
        )[0];

        await program.methods
          .removeTodo(id)
          .accountsStrict({
            authority: publicKey,
            systemProgram: SystemProgram.programId,
            todoAccount: todoPDA,
            userProfile: userPDA,
          })
          .rpc();

        toast(`Successfully Removed Your Todo`, {
          position: "bottom-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
          transition: Bounce,
        });
      } catch (error) {
        console.log(error);
        toast.error("Error Occured while removing todo");
      } finally {
        setTrxPending(false);
        setLoading(false);
      }
    }
  };

  const incompleteTodos = useMemo(
    () => todos.filter((todo) => !todo.account.markedBool),
    [todos]
  );
  const completedTodos = useMemo(
    () => todos.filter((todo) => todo.account.markedBool),
    [todos]
  );

  const solanaHookUse = {
    hooks:{
      userInitiated,
    initializeUser,
    loading,
    trxPending,
    incompleteTodos,
    completedTodos,
    addTodo,
    markTodo,
    removeTodo,
    todos
    }
  };

  return solanaHookUse
};

export default useConnectWallet;
