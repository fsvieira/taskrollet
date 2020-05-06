import React, { useState } from "react";

import { useActiveTasks } from "../db/tasks/hooks";
import Task from "../components/Task";
import { AppToaster } from '../components/Notification';
import {
    RadioGroup,
    Radio,
    Popover,
    Position,
    Intent,
    Button,
    Colors,
    Elevation,
    Card
} from "@blueprintjs/core";

import moment from "moment";
import SelectTags from '../components/SelectTags';
import stringSimilarity from 'string-similarity';
// import SelectOrder from '../components/SelectOrder';

function sort(tasks, orderBy) {
    if (orderBy === "similiar") {
        const order = tasks.slice().sort((a, b) => b.description.localeCompare(a.description));
        const r = [];

        while (order.length) {
            const a = order.shift();
            r.push(a);

            let index = 0, rank = 0.5;
            for (let i = 0; i < order.length; i++) {
                const b = order[i];

                const bRank = stringSimilarity.compareTwoStrings(a.description, b.description);

                console.log(a.description, b.description, bRank);

                if (bRank > rank) {
                    rank = bRank;
                    index = i;
                }
            }

            if (index) {
                const t = order[0];
                order[0] = order[index];
                order[index] = t;
            }
        }

        return r;
    }
    else {
        return tasks.sort(
            (a, b) => orderByCmp(orderBy, a, b)
        );
    }
}

function orderByCmp(orderBy, a, b) {
    console.log(orderBy);
    switch (orderBy) {
        case "createdAt":
            return moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf();

        case "updatedAt":
            return moment(b.updatedAt).valueOf() - moment(a.updatedAt).valueOf();

        case "doneUntil":
            return moment(b.doneUntil).valueOf() - moment(a.doneUntil).valueOf();

        case "size":
            return b.description.length - a.description.length;

        /*
        case "similiar":
            const order = all.slice().sort((a, b) => b.description.localeCompare(a.description));

            const r = [];

            while (order.length) {
                const a = order.shift();
                r.push(a);

                let index = 0, rank = 0.5;
                for (let i = 0; i < order.length; i++) {
                    const b = order[i];

                    const bRank = stringSimilarity.compareTwoStrings(a.description, b.description);

                    console.log(a.description, b.description, bRank);

                    if (bRank > rank) {
                        rank = bRank;
                        index = i;
                    }
                }

                if (index) {
                    const t = order[0];
                    order[0] = order[index];
                    order[index] = t;
                }
            }

            return r;
        */
    }
}

function SelectOrder({ orderBy, setOrderBy }) {
    const selector = <div style={{ padding: "0.5em" }}>
        <RadioGroup
            label="Order By"
            onChange={e => setOrderBy(e.target.value)}
            selectedValue={orderBy}
        >
            <Radio label="creation date" value="createdAt" />
            <Radio label="update date" value="updatedAt" />
            <Radio label="done until" value="doneUntil" />
            <Radio label="size" value="size" />
            <Radio label="similiar" value="similiar" />
        </RadioGroup>
    </div>;

    return (
        <Popover content={selector} position={Position.BOTTOM}>
            <Button icon="sort" />
        </Popover>
    );
}


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
    const [orderBy, setOrderBy] = useState("updatedAt");

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

    const tasksList = sort(
        tasks.filter(t => t.description.toLowerCase().indexOf(searchText.toLocaleLowerCase()) !== -1),
        orderBy
    )
        // .sort((a, b) => orderByCmp(orderBy, a, b, tasks))
        .map(
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
                <SelectOrder setOrderBy={setOrderBy} orderBy={orderBy} />
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

