import React, { useState } from "react";
import { useTranslation } from 'react-i18next';

import { useAllTasks /*useActiveTasks*/ } from "../db/tasks/hooks";
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
    Card,
    Tab,
    Tabs,
    Tooltip
} from "@blueprintjs/core";

import moment from "moment";
import SelectTags from '../components/SelectTags';
import stringSimilarity from 'string-similarity';
import { resetTask } from "../db/tasks/db";

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

        case "size":
            return b.description.length - a.description.length;
    }
}

function SelectOrder({ orderBy, setOrderBy, t }) {
    const [isOpen, setIsOpen] = useState(false);

    const selector = <div style={{ padding: "0.5em" }}>
        <RadioGroup
            label="Order By"
            onChange={e => {
                setOrderBy(e.target.value);
                setIsOpen(false);
            }
            }
            selectedValue={orderBy}
        >
            <Radio label="creation date" value="createdAt" />
            <Radio label="update date" value="updatedAt" />
            <Radio label="size" value="size" />
            <Radio label="similiar" value="similiar" />
        </RadioGroup>
    </div>;

    return (
        <Popover
            content={selector}
            position={Position.BOTTOM}
            isOpen={isOpen}
            onInteraction={isOpen => setIsOpen(isOpen)}
        >
            <Tooltip content={t("SORT")} position={Position.TOP}>
                <Button icon="sort" onClick={() => setIsOpen(!isOpen)} />
            </Tooltip>
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
    } = useAllTasks(); // useActiveTasks();

    const { t } = useTranslation();

    const [showSearch, setShowSearch] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [orderBy, setOrderBy] = useState("updatedAt");
    const [selectedTab, setSelectedTab] = useState("active");
    const [display, setDisplay] = useState("list");

    if (tasks.length === 0) {
        return (<Card interactive={true} elevation={Elevation.TWO} style={{ margin: '1em' }}>
            <p>{t("EMPTY_TASK_LIST_MSG")}</p>
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

    const renderTasksList = (
        tasks,
        {
            doneTask,
            doneTaskUntil,
            deleteTask,
            selectTodoNotification,
            recoverTask,
            canEditTask,
            canSplitTask
        }
    ) => tasks.map(
        task => <Task
            task={task}
            doneTask={doneTask}
            doneTaskUntil={doneTaskUntil}
            deleteTask={deleteTask}
            selectTodo={selectTodoNotification}
            canEditTask={canEditTask}
            canSplitTask={canSplitTask}
            recoverTask={recoverTask}
            key={task._id}
        ></Task>
    );

    /*
    const renderTasksList = (tasks, actions) =>
        <div style={{
            display: "flex",
            flexWrap: "wrap",
            flexDirection: "row"
        }}>{renderTasksListAux(tasks, actions)}</div>;*/

    const tasksList = sort(
        tasks.filter(t => t.description.toLowerCase().indexOf(searchText.toLocaleLowerCase()) !== -1),
        orderBy
    );

    const isDoneUntil = doneUntil => moment(doneUntil).isAfter(moment());

    const activeTasks = renderTasksList(
        tasksList.filter(t => !t.done && !t.deleted && !isDoneUntil(t.doneUntil)),
        {
            doneTask, doneTaskUntil,
            deleteTask, selectTodoNotification,
            canEditTask: true,
            canSplitTask: true
        }
    );

    const doneUntilTasks = renderTasksList(
        tasksList.filter(t => !t.done && !t.deleted && isDoneUntil(t.doneUntil)),
        { doneTask, doneTaskUntil, deleteTask, selectTodoNotification }
    );

    const doneTasks = renderTasksList(tasksList.filter(
        t => t.done && !t.deleted),
        { recoverTask: resetTask }
    );

    const deletedTasks = renderTasksList(tasksList.filter(t => t.deleted), { recoverTask: resetTask });

    const tasksTable = [
        ["active", { tasks: activeTasks, label: "Active" }],
        ["doneUntil", { tasks: doneUntilTasks, label: t("DONE_UNTIL") }],
        ["done", { tasks: doneTasks, label: "Done" }],
        ["deleted", { tasks: deletedTasks, label: "Deleted" }]
    ];

    const tasksMap = new Map(tasksTable);

    const selectedTabFunc = tab => {
        const { tasks } = tasksMap.get(tab);

        if (tasks.length) {
            return tab;
        }

        for (let i = 0; i < tasksTable.length; i++) {
            const [tab, { tasks }] = tasksTable[i];

            if (tasks.length) {
                return tab;
            }
        }
    }

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
                <SelectOrder setOrderBy={setOrderBy} orderBy={orderBy} t={t} />
                <SelectTags
                    onChange={tags => setTags(tags)}
                    noText={true}
                    style={{ float: "left" }}
                />
                <div style={{ float: "left" }}>
                    <Tooltip content={t("SEARCH")} position={Position.TOP}>
                        <Button
                            icon="search-template"
                            onClick={() => setShowSearch(!showSearch)}
                        ></Button>
                    </Tooltip>

                    {showSearch && <input
                        ref={el => el && el.focus()}
                        className="bp3-input"
                        type="text"
                        placeholder="Search"
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                    />}
                </div>
                <Tooltip content={t("VIEW")} position={Position.TOP}>
                    <Button
                        icon={display === "list" ? "list" : "grid-view"}
                        onClick={() => setDisplay(
                            display === "list" ? "grid-view" : "list"
                        )}
                    />
                </Tooltip>
            </div>
            <article style={{ marginTop: "3em" }}>

                <Tabs
                    onChange={value => setSelectedTab(value)}
                    selectedTabId={selectedTabFunc(selectedTab)}
                >
                    {/*
                        {!!activeTasks.length && <Tab id="active" title={`Active (${activeTasks.length})`} panel={activeTasks} />}
                        {!!doneUntilTasks.length && <Tab id="doneUntil" title={`Done Until ${doneUntilTasks.length}`} panel={doneUntilTasks} />}
                        {!!doneTasks.length && <Tab id="done" title={`Done ${doneTasks.length}`} panel={doneTasks} />}
                        {!!deletedTasks.length && <Tab id="deleted" title={`Deleted ${deletedTasks.length}`} panel={deletedTasks} />}
                    */}
                    {tasksTable
                        .filter(([tab, { tasks }]) => tasks.length > 0)
                        .map(([tab, { tasks, label }]) =>
                            <Tab
                                id={tab}
                                title={`${label} (${tasks.length})`}
                                panel={
                                    <div style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        flexDirection: display === "list" ? "column" : "row"
                                    }}>
                                        {tasks}
                                    </div>
                                }
                                key={tab}
                                style={{ float: "left" }}
                            />
                        )
                    }
                    <Tabs.Expander />
                </Tabs>
            </article>
        </section>
    );
}

