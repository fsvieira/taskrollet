import PouchDB from "pouchdb";
import PouchDBFind from "pouchdb-find";

import moment from "moment";

PouchDB.plugin(PouchDBFind);

export const dbTasks = new PouchDB("tasks");

export const addTask = async task => await dbTasks.post({...task, createdAt: moment().toDate()});
export const doneTask = task => dbTasks.put({...task, done: true, closedAt: moment().toDate()});
export const deleteTask = task => dbTasks.put({...task, deleted: true, closedAt: moment().toDate()});
