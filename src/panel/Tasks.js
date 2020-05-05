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

import SelectTags from '../components/SelectTags';
import SelectOrder from '../components/SelectOrder';

export default function Tasks() {
    const {
        tasks,
        doneTask,
        doneTaskUntil,
        deleteTask,
        selectTodo,
        setTags
    } = useActiveTasks();

    const [showSearch, setShowSearch] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [orderedTasks, setOrderedTasks] = useState();

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

    const tasksList = (orderedTasks || tasks).filter(t => t.description.toLowerCase().indexOf(searchText.toLocaleLowerCase()) !== -1).map(
        task => (<Task
            task={task}
            doneTask={doneTask}
            doneTaskUntil={doneTaskUntil}
            deleteTask={deleteTask}
            selectTodo={selectTodoNotification}
            canEditTask={true}
            canSplitTask={true}
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
                <SelectOrder setOrderedTasks={setOrderedTasks} tasks={tasks} />
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
                    {showSearch && <input
                        className="bp3-input"
                        type="text"
                        placeholder="Search"
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                    />}
                </div>
            </div>
            <article style={{ marginTop: "3em" }}>
                {tasksList}
            </article>
        </section>
    );
}

