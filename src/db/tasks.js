// import PouchDB from 'pouchdb';
// import PouchDBFind from 'pouchdb-find';

import { useState, useEffect } from 'react';

import {dbTasks, dbTODOs} from "./db";


// PouchDB.plugin(PouchDBFind);

// export const dbTasks = new PouchDB('tasks');
// const dbState = new PouchDB('state');
// const dbTODOs = new PouchDB('todo');

// Setup 

// Setup end!!

async function getTODO (force, tags=[]) {
    let todo;

    console.log("TAGS => " + JSON.stringify(tags));
    try {
        console.log("---")
        todo = await dbTODOs.get("todo");
        console.log(todo);
    }
    catch (e) {
        console.log(e);
        todo = {tags: [], _id: "todo"};
    }
    
    if (!force && todo.task) {
        // make sure todo task is updated,
        try {
            todo.task = await dbTasks.get(todo.task._id);

            force = force || tags.filter(tag => todo.task.tags.includes(tag)).length !== tags.length;
        }
        catch (e) {
            delete todo.task;
        }     
    }

    const todos = (await dbTasks.find({
        selector: {
            deleted: null,
            done: null
        }
    })).docs.filter(
        task => tags.filter(tag => task.tags.includes(tag)).length === tags.length
    );

    if (force || !todo.task || todo.task.deleted || todo.task.done) {
        if (todos.length) {
            const index = Math.floor(Math.random() * todos.length);
            const task = todos[index];
        
            todo.task = task;
        }
        else {
            delete todo.task;
        }
    }
    
    todo.total = todos.length;

    await dbTODOs.put(todo);

    
    return todo;
}

async function setTODO (task) {
    let todo;

    try {
        todo = await dbTODOs.get("todo");
    }
    catch (e) {
        todo = {tags: [], _id: "todo"};
    }

    const todos = (await dbTasks.find({
        selector: {
            deleted: null,
            done: null
        }
    })).docs;

    todo.task = task;

    todo.total = todos.length;

    await dbTODOs.put(todo);

    return todo;


}

// === DB Tasks functions ===
export const addTask = async task => {
    task.createdAt = new Date();
    await dbTasks.post(task);

    return task;
}

export const doneTask = task => dbTasks.put({...task, done: true, closedAt: new Date()});
export const deleteTask = task => dbTasks.put({...task, deleted: true, closedAt: new Date()});
export const dismissTask = () => getTODO(true);
export const selectTask = task => setTODO(task);

// === Subscriptions ===
export function subscribeTODO (fn, tags) {
    // let todo;
    const todoListener = dbTODOs.changes({
        since: 'now',
        live: true,
        include_docs: true,
        filter: todo => todo._id === 'todo'
    }).on("change", change => {
        // todo = change.doc;
        fn(change.doc);
    });

    // Listen to task changes, and trigger update todo, 
    // but only if todo task id has change.
    const tasksListener = dbTasks.changes({
        since: 'now',
        live: true,
        include_docs: true,
        // filter: t => !todo || !todo.task || (t._id === todo.task._id)
    }).on("change", () => getTODO(false, tags));

    getTODO(false, tags).then(fn);

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

    tasks.docs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
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

// --- Tags
export async function getActiveTags () {
    const tags = await dbTasks.find({
        selector: {
            deleted: null,
            done: null
        }
    });

    return tags.docs.reduce((acc, t) => [...new Set(t.tags.concat(acc))], []);
}

export function subscribeActiveTags(fn) {
    let listener;

    getActiveTags().then(fn);

    listener = dbTasks.changes({
        since: 'now',
        live: true,
        include_docs: true
    })
    .on("change", async () => {
        fn(await getActiveTags());
    });

    return () => listener.cancel();
}

// === Hooks,
export const useTODO = () => {
    const [todo, setTODO] = useState({});
    const [tags, setTags] = useState([]);

    function handleTODOChange(todo, tags) {
        setTODO(todo);
        setTags(tags);
    }

    useEffect(() => {
        return subscribeTODO(handleTODOChange, tags);
    }, [(todo?todo._id:todo) + "::" + JSON.stringify(tags)]);

    return {
        todo,
        doneTask,
        dismissTask: (todo && todo.total > 1)?dismissTask:undefined,
        deleteTask,
        tags,
        setTags
    };
}


export const useTasks = () => {
    const [tasks, setTasks] = useState([]);
  
    const handleTasksChange = tasks => {
        setTasks(tasks);
    }

    useEffect(
        () => subscribeActiveTasks(handleTasksChange), 
        [true]
    );
  
    return {
        tasks,
        doneTask,
        deleteTask,
        selectTask
    };
}

export const useActiveTags = () => {
    const [tags, setTags] = useState([]);
  
    const handleTagsChange = tags => {
        setTags(tags);
    }

    useEffect(
        () => subscribeActiveTags(handleTagsChange), 
        [true]
    );
  
    return tags;
}
