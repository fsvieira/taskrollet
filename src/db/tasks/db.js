import { db, genID, changes } from "../db";
import moment from "moment";

export const addTask = ({ computed, ...task }, createdAt) => {
    const now = moment.utc().toDate();

    return db().tasks.add({
        taskID: genID(),
        ...task,
        done: 0,
        deleted: 0,
        createdAt: createdAt || now,
        updatedAt: now
    });
}

export const editTask = ({ computed, ...task }) => db().tasks.put({ ...task, updatedAt: moment().toDate() });
export const doneTask = ({ computed, ...task }) => db().tasks.put({ ...task, done: 1, updatedAt: moment().toDate() });
export const doneTaskUntil = ({ computed, ...task }, doneUntil) => db().tasks.put({ ...task, doneUntil, updatedAt: moment().toDate() });
export const deleteTask = ({ computed, ...task }) => db().tasks.put({ ...task, deleted: 1, updatedAt: moment().toDate() });
export const resetTask = ({ computed, ...task }) => {
    if (task.deleted || task.done || task.doneUntil) {
        db().tasks.put({ ...task, deleted: 1, updatedAt: moment().toDate() });
    }
};
