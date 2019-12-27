import React, { Component} from "react";

import Task from "./Task";
import {useTODO} from "../db/tasks";

export default function TODO () {
  const {todo, doneTask, dismissTask, deleteTask} = useTODO([]);

  console.log(JSON.stringify(todo));

  return (
    <Task 
      task={todo.task}
      doneTask={doneTask}
      dismissTask={dismissTask}
      deleteTask={deleteTask}
    />
  );
}

