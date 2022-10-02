import { createRouter } from "./context";
import { z } from "zod";
import { TRPCClientError } from "@trpc/client";

export interface Todo {
  id: number;
  text: string;
  done: boolean;
}

const todos = [
  { id: 1, text: "First", done: true },
  { id: 2, text: "Second", done: false },
  { id: 3, text: "Third", done: false },
];

export const exampleRouter = createRouter()
  .query("hello", {
    input: z
      .object({
        text: z.string().nullish(),
      })
      .nullish(),
    resolve({ input }) {
      return {
        greeting: `Hello ${input?.text ?? "world"}`,
      };
    },
  })
  .query("todos", {
    resolve() {
      return todos;
    },
  })
  .mutation("toggleTodo", {
    input: z.object({
      id: z.number(),
    }),
    async resolve({ input }) {
      const todo = todos.find((todo) => todo.id === input.id);
      if (!todo) {
        // throw new Error("Todo not found");
        throw new TRPCClientError("Todo not found", {
          result: todo,
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (Math.random() > 0.5 || input.id === 3) {
        throw new Error("Random error");
      }

      todo.done = !todo.done;
      return todo;
    },
  });
