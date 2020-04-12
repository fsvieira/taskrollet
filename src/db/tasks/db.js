import PouchDB from "pouchdb";
import PouchDBFind from "pouchdb-find";

import moment from "moment";

PouchDB.plugin(PouchDBFind);

export const dbTasks = new PouchDB("tasks");

dbTasks.setMaxListeners(100);

export const addTask = ({ computed, ...task }) =>
    task._id ?
        dbTasks.put({ ...task, createdAt: moment().toDate() }) :
        dbTasks.post({ ...task, createdAt: moment().toDate() })
    ;

export const doneTask = ({ computed, ...task }) => dbTasks.put({ ...task, done: true, closedAt: moment().toDate() });
export const doneTaskUntil = ({ computed, ...task }, doneUntil) => {
    console.log("TODO: done task until", moment(doneUntil).toString());
    dbTasks.put({ ...task, doneUntil, closedAt: moment().toDate() });
}

export const deleteTask = ({ computed, ...task }) => dbTasks.put({ ...task, deleted: true, closedAt: moment().toDate() });
