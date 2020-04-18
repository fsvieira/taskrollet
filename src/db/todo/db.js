import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import { doneTaskUntil } from "../tasks/db";

PouchDB.plugin(PouchDBFind);

export const dbTodo = new PouchDB('todo');

export const selectTodo = async (task, tags) => {
    try {
        if (task.doneUntil) {
            await doneTaskUntil(task)
        }

        const todo = await dbTodo.get("todo");
        return dbTodo.put({ ...todo, task: task._id, tags: tags || { all: true } });
    }
    catch (e) {
        return dbTodo.put({ _id: "todo", task: task._id, tags: { all: true } });
    }
}

export const dismissTodo = async () => {
    try {
        const { _id, _rev, tags } = await dbTodo.get("todo");
        return dbTodo.put({ _id, _rev, tags, task: null });
    }
    catch (e) {
        return dbTodo.put({ tags: { all: true } });
    }
}

export const setTodoFilterTags = async tags => {
    try {
        // remove strange values before going to db,
        for (let tag in tags) {

            if (!tags[tag]) {
                delete tags[tag];
            }
            else {
                tags[tag] = !!tags[tag];
            }
        }

        const todo = await dbTodo.get("todo");
        return dbTodo.put({ ...todo, tags });
    }
    catch (e) {
        return dbTodo.put({ tags });
    }
}
