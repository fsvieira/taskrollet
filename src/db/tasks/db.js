import { db, genID, changes } from "../db";
import moment from "moment";

export { db, changes };

export const addTask = ({ computed, tags, ...task }) => {
    const now = moment.utc().toDate();

    console.log("ADD TASK ", {
        type: "task",
        attributes: {
            ...task,
            /*done: false,
            deleted: false,
            createdAt: now,
            updatedAt: now*/
        }
    });

    return db.update(tx => [
        tx.addRecord({
            type: "task",
            id: 1,
            attributes: {
                ...task,
                done: false,
                deleted: false,
                createdAt: now,
                updatedAt: now
            }
        })
    ]);

    /*
    return dbTasks.add({
        // taskID: genID(),
        ...task,
        done: 0,
        deleted: 0,
        createdAt: now,
        updatedAt: now
    });*/
}

export const editTask = ({ computed, ...task }) => db.update(
    tx => tx.updateRecord({ ...task, updatedAt: moment().toDate() })
);

export const doneTask = ({ computed, ...task }) => db.update(
    tx => tx.updateRecord({ ...task, done: 1, updatedAt: moment().toDate() })
);

export const deleteTask = ({ computed, ...task }) => db.update(
    tx => tx.updateRecord({ ...task, deleted: 1, updatedAt: moment().toDate() })
);
