import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import { resetTask } from "../tasks/db";

PouchDB.plugin(PouchDBFind);

export const dbTodo = new PouchDB('todo');

export const selectTodo = async task => {
    /*    if (task.doneUntil) {
            await doneTaskUntil(task)
        }*/

    try {
        await resetTask(task);

        const { _id, _rev } = await dbTodo.get("todo");
        return dbTodo.put({ _id, _rev, task: task._id });
    }
    catch (e) {
        return dbTodo.put({ _id: "todo", task: task._id });
    }
}

export const dismissTodo = async () => {
    try {
        const { _id, _rev } = await dbTodo.get("todo");
        return dbTodo.put({ _id, _rev, task: null });
    }
    catch (e) {
        return dbTodo.put({ _id: "todo", task: null });
    }

}
