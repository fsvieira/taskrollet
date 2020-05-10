import { useState, useEffect } from 'react';

import { dismissTodo } from "./db";
import { $activeTodo } from "./streams";
import { deleteTask, doneTask, doneTaskUntil } from "./../tasks/db";

// There is probaly a better way to do it.
let memTags = { all: true };

export const useTodo = () => {
    const [todo, setTodo] = useState({});
    const [tags, setTags] = useState(memTags);

    useEffect(
        () => {
            memTags = tags;
            const cancel = $activeTodo(tags).onValue(setTodo);

            return () => cancel();
        },
        [JSON.stringify(tags)]
    );

    return {
        todo,
        tags,
        setTags,
        doneTask,
        doneTaskUntil,
        dismissTodo,
        deleteTask
    };
}
