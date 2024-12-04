import { PublicKey } from "@solana/web3.js";
import Idl from "../../../target/idl/todo_dapp.json"

export const TODO_PROGRAM_PUBKEY = new PublicKey(Idl.address)