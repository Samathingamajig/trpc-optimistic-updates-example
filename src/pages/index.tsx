import type { NextPage } from "next";
import type { Todo } from "../server/router/example";
import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  // const { data } = trpc.useQuery(["example.hello", { text: "from tRPC" }]);
  const { data } = trpc.useQuery(["example.todos"], {});
  const trpcContext = trpc.useContext();
  const toggleTodoMutation = trpc.useMutation("example.toggleTodo");

  const toggleTodo = async (todo: Todo) => {
    if (toggleTodoMutation.isLoading) return;

    const toggleTodoPromise = toggleTodoMutation.mutateAsync(
      { id: todo.id },
      {
        onError(error, variables, context) {
          console.log("onError", error, variables, context);
        },
      },
    );
    trpcContext.setQueryData(
      ["example.todos"],
      (old) =>
        old?.map((oldTodo) => ({
          ...oldTodo,
          done: oldTodo.id === todo.id ? !oldTodo.done : oldTodo.done,
        })) ?? [],
    );
    try {
      const newTodo = await toggleTodoPromise;

      trpcContext.setQueryData(
        ["example.todos"],
        (prev) =>
          prev?.map((prev) =>
            prev.id === newTodo.id
              ? newTodo
              : {
                  ...prev,
                },
          ) ?? [],
      );
    } catch {
      trpcContext.setQueryData(
        ["example.todos"],
        (old) =>
          old?.map((oldTodo) => ({
            ...oldTodo,
            done: oldTodo.id === todo.id ? !oldTodo.done : oldTodo.done,
          })) ?? [],
      );
    }
  };

  return (
    <>
      <p>{JSON.stringify(data)}</p>
      {toggleTodoMutation.isLoading && <p>Toggle Todo is loading...</p>}
      {toggleTodoMutation.error && <p>The most recent toggle todo failed :(</p>}
      <div
        style={{
          opacity: toggleTodoMutation.isLoading ? 0.5 : 1,
        }}
      >
        {data?.map((todo) => (
          <div
            key={todo.id}
            style={{
              textDecoration: todo.done ? "line-through" : "none",
              cursor: toggleTodoMutation.isLoading ? "not-allowed" : "pointer",
            }}
            onClick={() => toggleTodo(todo)}
          >
            <input type="checkbox" checked={todo.done} disabled={toggleTodoMutation.isLoading} />
            {todo.text}
          </div>
        ))}
      </div>
    </>
  );
};

export default Home;
