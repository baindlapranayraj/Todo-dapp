import { Box, Flex, Strong, Heading, Text } from "@radix-ui/themes";
import { TargetIcon } from "@radix-ui/react-icons";
import { useTodoStore } from "../store/useTodoStore";
import { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { Footer, InputTodo, Todos } from "./Import";
import "@solana/wallet-adapter-react-ui/styles.css";
import { useWallet } from "@solana/wallet-adapter-react";
import { TodoAccountType } from "../types/programTypes";
import useConnectWallet from "../hooks/useConnectWallet";

export const TodoLayout = () => {
  const todoStore = useTodoStore((state) => state);
  const {hooks} = useConnectWallet();

  const [filterTodo, setFilterTodo] = useState<TodoAccountType>([]);

  useEffect(() => {
    const { updateState } = todoStore;
    const {todos} = hooks;
    updateState(todos)

    setFilterTodo(todos);
    console.log(todos);
  }, [todoStore.todoType]);
  const { publicKey } = useWallet();

  return (
    <>
      <Box width="800px" className="bg-zinc-900 rounded-lg p-9 m-9 mt-20">
        <Flex justify={"between"} align={"center"}>
          <Flex gap={"4"} align={"center"}>
            <TargetIcon width={25} height={30} color="white" />
            <Heading size={"7"}>
              <Strong className="to-inherit font-serif">Task Manager</Strong>
            </Heading>
          </Flex>
          <Text size={"1"}>{publicKey?.toString()}</Text>
        </Flex>
        <Box className="my-10 space-y-8">
          <InputTodo createTodo={todoStore.createTodo} />
          <Todos currentTodos={filterTodo} />
        </Box>
        <hr className="text-gray-900 mb-6 font-thin" color="gray" />
        <Footer setFilter={setFilterTodo} />
      </Box>
    </>
  );
};

// export default TodoLayout;
