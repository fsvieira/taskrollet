import { useState, useEffect } from 'react';

import { setTodoFilterTags, dismissTodo } from "./db";
import { $activeTodo } from "./streams";
import { deleteTask, doneTask } from "./../tasks/db";

export const useTodo = () => {
    const [todo, setTodo] = useState({});
    
    useEffect(
        () => {
            const cancel = $activeTodo().onValue(setTodo);

            return () => cancel();
        },
        [true]
    );
  
    const setTags = tags => setTodoFilterTags({...todo, tags});

    return {
        todo,
        setTags,
        doneTask,
        dismissTodo,
        deleteTask
    };
}
