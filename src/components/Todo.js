import React from "react";

import Task from "./Task";
import SelectTags from "./SelectTags";
import { useTodo } from "../db/todo/hooks";

import "@blueprintjs/core/lib/css/blueprint.css";


export default function Todo () {
  const {todo, setTags, doneTask, dismissTodo, deleteTask} = useTodo();

  const taskHeader = (
    <div>
    <span>Tasks: {todo.total} </span>
    <span style={{float: "right"}}>
      <SelectTags
        onChange={tags => setTags(tags)}
        filterTags={todo.tags}
      />
    </span>
  </div>);

  return (<Task 
        task={todo.task}
        doneTask={doneTask}
        dismissTodo={todo.total > 1?dismissTodo:undefined}
        deleteTask={deleteTask}
      >
        {taskHeader}
      </Task>
  );
}

