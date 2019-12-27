import React from "react";

import {useTasks} from "../db/tasks";
import Task from "../components/Task";

export default function Tasks () {
    const {
        tasks,
        doneTask,
        deleteTask
    } = useTasks();

    const tasksList = tasks.map(
        task => <Task 
                task={task}
                doneTask={doneTask}
                deleteTask={deleteTask}
                key={task._id}
            ></Task>
    );

    return (
        <section style={{overflow: "auto"}}>
            <article>
                {tasksList}
            </article>
        </section>
    );
}

