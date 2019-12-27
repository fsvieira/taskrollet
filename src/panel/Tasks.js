import React from "react";

import {useTasks} from "../db/tasks";
import Task from "../components/Task";

export default function Tasks () {
    const {
        tasks,
        doneTask,
        deleteTask
    } = useTasks();

    tasks.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    console.log(JSON.stringify(tasks));
    /*
    return <div>{JSON.stringify(tasks)}</div>;*/
    return tasks.map(
        task => <Task 
                task={task}
                doneTask={doneTask}
                deleteTask={deleteTask}
                key={task._id}
            ></Task>
    );
}
