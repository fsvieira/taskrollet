import { useState, useEffect } from 'react';

import { dismissTodo } from "./db";
import { $activeTodo } from "./streams";
import { deleteTask, doneTask, doneTaskUntil } from "./../tasks/db";

export const useTodo = () => {
    const [todo, setTodo] = useState({});
    const [tags, setTags] = useState({ all: true });

    useEffect(
        () => {
            console.log(tags);
            const cancel = $activeTodo(tags).onValue(setTodo);

            return () => cancel();
        },
        [JSON.stringify(tags)]
    );

    return {
        todo,
        setTags,
        doneTask,
        doneTaskUntil,
        dismissTodo,
        deleteTask
    };
}
