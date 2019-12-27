import React from "react";

import Task from "./Task";
import SearchTags from "./SelectTags";
import {useTODO} from "../db/tasks";

import "@blueprintjs/core/lib/css/blueprint.css";


export default function TODO () {
  const {todo, doneTask, dismissTask, deleteTask} = useTODO([]);

  const taskHeader = (
    <div>
    <span>Tasks: {todo.total} </span>
    <span style={{float: "right"}}>
      <SearchTags
        onChange={tags => console.log("Tags", tags)}
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

