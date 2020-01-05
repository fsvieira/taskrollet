import { useState, useEffect } from 'react';

import { setTodoFilterTags, dismissTodo } from "./db";
import { $activeTodo } from "./streams";
import { deleteTask, doneTask } from "./../tasks/db";

export const useTodo = () => {
    const [todo, setTodo] = useState({});
    
    useEffect(
        () => {
            const cancel = $activeTodo(todo.tags).onValue(setTodo);

            return () => cancel();
        },
        [JSON.stringify(todo.tags)]
    );
  
    const setTags = tags => setTodoFilterTags(tags);

    return {
        todo,
        setTags,
        doneTask,
        dismissTodo,
        deleteTask
    };
}
