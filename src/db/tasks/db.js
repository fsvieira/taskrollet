import { db, genID, changes } from "../db";
import moment from "moment";

export { db, changes };

export const addTask = ({ computed, tags, ...task }) => {
    const now = moment.utc().toDate();

    console.log("ADD: " + JSON.stringify(task));

    return db.update(tx => [
        tx.addRecord({
            type: "task",
            id: genID(),
            attributes: {
                ...task,
                done: false,
                deleted: false,
                createdAt: now,
                updatedAt: now
            }
        })
    ]);
}

export const editTask = ({ computed, ...task }) => db.update(
    tx => tx.updateRecord({ ...task, updatedAt: moment().toDate() })
);

export const doneTask = ({ computed, ...task }) => db.update(
    tx => tx.updateRecord({ ...task, done: true, updatedAt: moment().toDate() })
);

export const deleteTask = ({ computed, ...task }) => db.update(
    tx => tx.updateRecord({ ...task, deleted: true, updatedAt: moment().toDate() })
);
