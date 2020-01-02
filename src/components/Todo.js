import React from "react";

import Task from "./Task";
import SelectTags from "./SelectTags";
import {useTodo} from "../db/todo/hooks";

import "@blueprintjs/core/lib/css/blueprint.css";


export default function Todo () {
  const {todo, setTags, doneTask, dismissTask, deleteTask} = useTodo();

  console.log("TODO", todo);

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
        dismissTask={dismissTask}
        deleteTask={deleteTask}
      >
        {taskHeader}
      </Task>
  );
}

