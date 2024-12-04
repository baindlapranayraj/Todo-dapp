import { Button, Flex, Text } from "@radix-ui/themes";
import {  useTodoStore } from "../store/useTodoStore";
import { TodoAccountType } from "../types/programTypes";

type FilterType = "all" | "active" | "completed";
type FooterType = {
  setFilter: React.Dispatch<React.SetStateAction<TodoAccountType>>;
};

export const Footer = ({ setFilter }: FooterType) => {
  const todoStore = useTodoStore((state) => state);

  const filterBtn = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    filter: FilterType,
  ) => {
    e.preventDefault();
    if (filter === "all") {
      setFilter(todoStore.todoType);
    } else if (filter === "active") {
      const updatedTodos = todoStore.todoType.filter(
        (todo) => todo.account.markedBool == false,
      );
      setFilter(updatedTodos);
    } else if (filter === "completed") {
      const updateTodos = todoStore.todoType.filter(
        (todo) => todo.account.markedBool === true,
      );
      setFilter(updateTodos);
    }
  };

  return (
    <>
      <Flex justify={"between"}>
        <Text color="gray" className="font-mono text-sm">
          {todoStore.todoType.length} Tasks
        </Text>
        {todoStore.todoType.length === 0 ? null : (
          <Flex gap={"4"}>
            <Button onClick={(e) => filterBtn(e, "all")} variant="soft">
              All
            </Button>
            <Button onClick={(e) => filterBtn(e, "active")} variant="soft">
              Active
            </Button>
            <Button onClick={(e) => filterBtn(e, "completed")} variant="soft">
              Completed
            </Button>
          </Flex>
        )}
      </Flex>
    </>
  );
};
