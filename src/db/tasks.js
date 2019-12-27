import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

import { useState, useEffect } from 'react';


PouchDB.plugin(PouchDBFind);

const dbTasks = new PouchDB('tasks');
// const dbState = new PouchDB('state');
const dbTODOs = new PouchDB('todo');

dbTasks.createIndex({
    index: {
      fields: ['done', 'deleted']
    }
});

async function getTODO (force) {
    let todo;

    try {
        todo = await dbTODOs.get("todo");
    }
    catch (e) {
        todo = {tags: [], _id: "todo"};
    }
    
    if (!force && todo.task) {
        // make sure todo task is updated,
        try {
            todo.task = await dbTasks.get(todo.task._id);
        }
        catch (e) {
            delete todo.task;
        }     
    }

    if (force || !todo.task || todo.task.deleted || todo.task.done) {
        const todos = (await dbTasks.find({
            selector: {
                deleted: null, 
                done: null
            }
        })).docs;

        todo.total = todos.length;

        if (todos.length) {
            const index = Math.floor(Math.random() * todos.length);
            const task = todos[index];
        
            todo.task = task;
        }
        else {
            delete todo.task;
        }

        await dbTODOs.put(todo);
    }
    
    return todo;
}

// === DB Tasks functions ===
export const addTask = async task => {
    await dbTasks.post(task);

    return task;
}

export const doneTask = task => dbTasks.put({...task, done: true});
export const deleteTask = task => dbTasks.put({...task, deleted: true});
export const dismissTask = () => getTODO(true);

// === Subscriptions ===
export function subscribeTODO (fn) {
    let todo;
    const todoListener = dbTODOs.changes({
        since: 'now',
        live: true,
        include_docs: true,
        filter: todo => todo._id === 'todo'
    }).on("change", change => {
        todo = change.doc;
        fn(change.doc);
    });

    // Listen to task changes, and trigger update todo, 
    // but only if todo task id has change.
    const tasksListener = dbTasks.changes({
        since: 'now',
        live: true,
        include_docs: true,
        filter: t => !todo || !todo.task || (t._id === todo.task._id)
    }).on("change", () => getTODO());

    getTODO().then(fn);

    return () => {
        todoListener.cancel();
        tasksListener.cancel();
    };
}

export async function getActiveTasks () {
    const tasks = await dbTasks.find({
        selector: {
            deleted: null,
            done: null
        }
    });

    return tasks.docs;
}

export function subscribeActiveTasks(fn) {
    let listener;

    getActiveTasks().then(fn);

    listener = dbTasks.changes({
        since: 'now',
        live: true,
        include_docs: true
    })
    .on("change", async () => {
        fn(await getActiveTasks());
    });

    return () => listener.cancel();
}

// === Hooks,
export const useTODO = tags => {
    const [todo, setTODO] = useState({});

    function handleTODOChange(todo) {
        setTODO(todo);
    }

    useEffect(() => {
        return subscribeTODO(handleTODOChange);
    }, [todo?todo._id:todo]);

    return {
        todo,
        doneTask,
        dismissTask,
        deleteTask
    };
}


export const useTasks = () => {
    const [tasks, setTasks] = useState([]);
  
    const handleTasksChange = tasks => {
        console.log(tasks);
        setTasks(tasks);
    }

    useEffect(
        () => subscribeActiveTasks(handleTasksChange), 
        [true]
    );
  
    return {
        tasks,
        doneTask,
        deleteTask
    };
}

