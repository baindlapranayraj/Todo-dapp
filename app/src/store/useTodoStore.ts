import { PublicKey } from "@solana/web3.js";
import { create } from "zustand";
import { TodoAccountType } from "../types/programTypes";
import { Bounce, toast } from "react-toastify";




export type TodoType = {
  content: string;
  id: number; // blockchain
  authour: PublicKey;
  marked_bool: boolean; // blockchain
};


type TodoStateType = {
  todoType: TodoAccountType;
  createTodo: (content: string,addBlockchainTodo:(content: string) => Promise<void>,todos:TodoAccountType) => void;
  markTodo: (idx: number) => void;
  removeTodo: (idx: number) => void;
  updateState: (todos:TodoAccountType) => void;
};

export const useTodoStore = create<TodoStateType>((set) => ({
  todoType: [],

  createTodo: async (content: string,addBlockchainTodo,todos) => {
    try {
      await addBlockchainTodo(content);
      toast("Added your Task to Solana Blockchian", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
    } catch (error) {
      toast("Error Occured Aniki!!", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
      console.log(`Dude some shit has occured ${error}`);
    }
    set(() => {
      return {
        todoType: todos
      };
    });
  },
  markTodo: (idx: number) => {
    set((state) => {
      const todo = state.todoType.find((todo) => todo.account.idx == idx);
      if (todo == undefined) {
        throw new Error("Id is Invalid");
      }
      const updateTodoState = state.todoType.map((todoIteam) => {
        if (todoIteam.account.idx == idx) {
          return {
            ...todoIteam,
            marked_bool: !todoIteam.account.markedBool,
          };
        }
        return todoIteam;
      });
      return {
        todoType: updateTodoState,
      };
    });
  },
  removeTodo: (idx: number) => {
    set((state) => {
      if (
        state.todoType.find((iteam) => iteam.account.idx == idx) == undefined
      ) {
        throw new Error("Invalid Index  Id");
      }
      const updatedTodoState = state.todoType.filter(
        (iteam) => iteam.account.idx != idx
      );
      return {
        todoType: updatedTodoState,
      };
    });
  },
  updateState: (todos:TodoAccountType) => {
    set(()=>{
      return{
        todoType:todos
      }
    })
  },
}));

// export const useTodoStore = todoStore((state) => state);
