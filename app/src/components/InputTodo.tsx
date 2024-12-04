import { Flex, Button, TextField } from "@radix-ui/themes";
import { useState } from "react";
import { Bounce, toast } from "react-toastify";
import { TodoAccountType } from "../types/programTypes";
import useConnectWallet from "../hooks/useConnectWallet";

type inputProp = {
    createTodo: (content: string, 
    addBlockchainTodo: (content: string) => Promise<void>, 
    todos: TodoAccountType) => void
};

export const InputTodo = (createTodoProp: inputProp) => {
  const [input, setInput] = useState("");
  const {addTodo,todos} = useConnectWallet().hooks

  const btnHandle = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const { createTodo } = createTodoProp;
    if (input == "") {
      toast("Please Add your Todo Aniki!!", {
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
      return;
    }
    if (input.length <= 4) {
      toast("Please Add Valid Todo Aniki!!  ", {
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
      return;
    }
    console.log(input);
    addTodo(input)
    setInput("");
  };

  return (
    <>
      <Flex
        // maxWidth={"1000px"}
        gap={"6"}
        align={"center"}
        // justify={"center"}
        // className="m-12 "
        mb={"8"}
      >
        <TextField.Root
          placeholder="Write your Todo"
          className="w-[460px]"
          size={"3"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        ></TextField.Root>
        <Button
          onClick={(e) => btnHandle(e)}
          variant="surface"
          size={"3"}
          color="blue"
        >
          Submit Todo
        </Button>
      </Flex>
    </>
  );
};
