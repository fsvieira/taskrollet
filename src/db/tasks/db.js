import PouchDB from "pouchdb";
import PouchDBFind from "pouchdb-find";

import moment from "moment";

PouchDB.plugin(PouchDBFind);

export const dbTasks = new PouchDB("tasks");

dbTasks.setMaxListeners(100);

export const addTask = ({ computed, ...task }, createdAt) =>
    task._id ?
        dbTasks.put({ ...task, updatedAt: moment().toDate() }) :
        dbTasks.post({ ...task, createdAt: createdAt || moment().toDate() })

export const doneTask = ({ computed, ...task }) =>
    dbTasks.put({ ...task, done: true, updatedAt: moment().toDate() })

export const doneTaskUntil = ({ computed, ...task }, doneUntil) =>
    dbTasks.put({ ...task, doneUntil, updatedAt: moment().toDate() })

export const deleteTask = ({ computed, ...task }) => dbTasks.put({ ...task, deleted: true, updatedAt: moment().toDate() })

export const resetTask = ({ computed, ...task }) => {
    if (task.deleted || task.done || task.doneUntil) {
        return dbTasks.put({ ...task, done: false, deleted: false, doneUntil: null, updatedAt: moment().toDate() });
    }
}