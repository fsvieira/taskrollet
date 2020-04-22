import React, { useState } from "react";

import { useActiveTasks } from "../db/tasks/hooks";
import Task from "../components/Task";
import { AppToaster } from '../components/Notification';
import {
    Intent,
    Button,
    Colors,
    Elevation,
    Card
} from "@blueprintjs/core";

import { saveAs } from 'file-saver';
import moment from 'moment';
import SelectTags from '../components/SelectTags';

export default function Tasks() {
    const {
        tasks,
        doneTask,
        deleteTask,
        selectTodo,
        setTags
    } = useActiveTasks();

    const [showSearch, setShowSearch] = useState(false);

    if (tasks.length === 0) {
        return (<Card interactive={true} elevation={Elevation.TWO} style={{ margin: '1em' }}>
            <p>Your task list is empty, please add a task.</p>
        </Card>);
    }

    const selectTodoNotification = async task => {
        const msg = task.description.length > 10 ? task.description.substring(0, 10) + "..." : task.description;

        try {
            await selectTodo(task);

            AppToaster.show({
                message: `Task ${msg} is set TODO.`,
                intent: Intent.SUCCESS
            });
        }
        catch (e) {
            AppToaster.show({
                message: `Error setting todo task: ${msg}`,
                intent: Intent.DANGER
            });

        }
    };

    function exportTasks() {
        var tasksBlob = new Blob([JSON.stringify(tasks, null, '\t')], { type: "text/plain;charset=utf-8" });
        saveAs(tasksBlob, `tasks-${moment().toISOString()}.json`);
    }

    const tasksList = tasks.map(
        task => (<Task
            task={task}
            doneTask={doneTask}
            deleteTask={deleteTask}
            selectTodo={selectTodoNotification}
            canEditTask={true}
            key={task._id}
        ></Task>)
    );

    return (
        <section style={{ overflow: "auto" }}>
            <div style={{
                position: "fixed",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 1,
                padding: "0.2em",
                backgroundColor: Colors.BLUE5
            }}>
                <Button
                    icon="download"
                    onClick={exportTasks}
                    style={{ float: "left" }}
                ></Button>

                <SelectTags
                    onChange={tags => setTags(tags)}
                    noText={true}
                    style={{ float: "left" }}
                />

                <div style={{ float: "left" }}>
                    <Button
                        icon="search-template"
                        onClick={() => setShowSearch(!showSearch)}
                    ></Button>
                    {showSearch && <input className="bp3-input" type="text" placeholder="Search" />}
                </div>
            </div>
            <article style={{ marginTop: "3em" }}>
                {tasksList}
            </article>
        </section>
    );
}

