import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

import { useState, useEffect } from 'react';


PouchDB.plugin(PouchDBFind);

const dbTasks = new PouchDB('tasks');
// const dbState = new PouchDB('state');
const dbTODOs = new PouchDB('todo');
const dbSprints = new PouchDB('sprints');

dbTasks.createIndex({
    index: {
      fields: ['createAt']
    }
});

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
    const todos = (await dbTasks.find({
        selector: {
            deleted: null,
            done: null
        }
    })).docs;

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

// === DB Sprints functions ===
export const addSprint = async sprint => {
    await dbSprint.post(sprint);
    return task;
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

    tasks.docs.sort((a, b) => new Date(a.createAt).getTime() - new Date(b.createAt).getTime());
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

// --- Sprints 
export async function getActiveSprints () {
    const sprints = await dbSprints.find();
    return sprints.docs;
}

export function subscribeActiveSprints (fn) {
    let listener;

    getActiveSprints().then(fn);

    listener = dbSprints.changes({
        since: 'now',
        live: true,
        include_docs: true
    })
    .on("change", async () => {
        fn(await getActiveSprints());
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
        dismissTask: (todo && todo.total > 1)?dismissTask:undefined,
        deleteTask
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
        deleteTask
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

export const useActiveSprints = () => {
    const [sprints, setSprints] = useState([]);
  
    const handleSprintsChange = sprints => {
        setSprints(sprints);
    }

    useEffect(
        () => subscribeActiveSprints(handleSprintsChange), 
        [true]
    );
  
    return {sprints, addSprint};
}
