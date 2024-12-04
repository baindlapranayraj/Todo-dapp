import { Box, Checkbox, Flex, Heading, Text } from "@radix-ui/themes";
import { useTodoStore } from "../store/useTodoStore";
import { TrashIcon } from "@radix-ui/react-icons";
import { TodoAccountType } from "../types/programTypes";

export const Todos = ({ currentTodos }: { currentTodos: TodoAccountType }) => {
  const todoStore = useTodoStore((state) => state);
  // const [isChecked, setIsChecked] = useState(false);

  const trashHandle = (
    e: React.MouseEvent<SVGElement, MouseEvent>,
    id: number,
  ) => {
    e.preventDefault();
    const { removeTodo } = todoStore;
    console.log(`The Todo id is: ${id}`);
    removeTodo(id);
  };

  if (currentTodos.length === 0) {
    return (
      <Heading className="my-10" color="gray">
        Write Some Todos Onichaaaaaa!!!!
      </Heading>
    );
  }

  return (
    <Box>
      <Flex direction={"column"} gap={"5"}>
        {currentTodos.map((todo) => (
          <Box
            className="todo p-5 bg-zinc-800 rounded-lg shadow-lg"
            key={todo.account.idx}
          >
            {
              <Flex justify={"between"} align={"center"}>
                <Box className="space-x-4">
                  <Checkbox
                    checked={todo.account.markedBool}
                    onClick={(e) => {
                      e.preventDefault();
                      todoStore.markTodo(todo.account.idx);
                    }}
                  />
                  {todo.account.markedBool ? (
                    <del>
                      <Text>{todo.account.content}</Text>
                    </del>
                  ) : (
                    <Text>{todo.account.content}</Text>
                  )}
                </Box>
                <TrashIcon
                  onClick={(e) => trashHandle(e, todo.account.idx)}
                  width={25}
                  height={25}
                  color="gray"
                  className="text-white font-bold hover:text-red-600 duration-300 transition-all cursor-pointer"
                />
              </Flex>
            }
          </Box>
        ))}
      </Flex>
    </Box>
  );
};
