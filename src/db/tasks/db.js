import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

PouchDB.plugin(PouchDBFind);

export const dbTasks = new PouchDB('tasks');

export const addTask = async task => await dbTasks.post({...task, createdAt: new Date()});
export const doneTask = task => dbTasks.put({...task, done: true, closedAt: new Date()});
export const deleteTask = task => dbTasks.put({...task, deleted: true, closedAt: new Date()});

