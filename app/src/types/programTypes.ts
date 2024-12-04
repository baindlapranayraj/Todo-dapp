import { ProgramAccount, web3 } from "@coral-xyz/anchor";

export type TodoAccountType = ProgramAccount<{
    content: string;
    authority: web3.PublicKey;
    idx: number;
    markedBool: boolean;
}>[]