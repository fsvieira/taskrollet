import { db, genID, changes } from "../db";
import moment from "moment";

const dbTasks = db.tasks;

export { dbTasks, changes };

export const addTask = ({ computed, ...task }) => {
    const now = moment.utc().toDate();

    return dbTasks.add({
        taskID: genID(),
        ...task,
        done: 0,
        deleted: 0,
        createdAt: now,
        updatedAt: now
    });
}

export const editTask = ({ computed, ...task }) => dbTasks.put({ ...task, updatedAt: moment().toDate() });
export const doneTask = ({ computed, ...task }) => dbTasks.put({ ...task, done: 1, updatedAt: moment().toDate() });
export const deleteTask = ({ computed, ...task }) => dbTasks.put({ ...task, deleted: 1, updatedAt: moment().toDate() });
