import {Signal} from "signal-polyfill";
import {Todo} from "./Todo.ts";

export const todos = new Signal.State<Todo[]>([]);