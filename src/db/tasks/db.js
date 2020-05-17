import { db, changes, onReady, refreshTime } from "../db";
import moment from "moment";

export { db, changes, onReady, refreshTime };

export const addTask = ({ computed, ...task }, createdAt) => {
    const now = moment.utc().valueOf();

    return db.update(tx => [
        ...task.relationships.tags.data.map(tag => tx.addRecord(tag)),
        tx.addRecord({
            ...task,
            attributes: {
                ...task.attributes,
                done: false,
                deleted: false,
                createdAt: createdAt || now,
                updatedAt: now
            }
        })
    ]);
}

export const editTask = ({ computed, ...task }) => {
    const now = moment.utc().valueOf();

    return db.update(tx => [
        ...task.relationships.tags.data.map(tag => tx.addRecord(tag)),
        tx.updateRecord({
            ...task,
            attributes: {
                ...task.attributes,
                updatedAt: now
            }
        })
    ]);
}

export const doneTask = ({ computed, ...task }) => db.update(
    tx => tx.updateRecord({
        ...task,
        attributes: {
            ...task.attributes,
            done: true,
            updatedAt: moment.utc().valueOf()
        }
    })
);

export const doneTaskUntil = ({ computed, ...task }, doneUntil) => {
    return db.update(
        tx => tx.updateRecord({
            ...task,
            attributes: {
                ...task.attributes,
                doneUntil,
                updatedAt: moment.utc().valueOf()
            }
        })
    )
};

export const deleteTask = ({ computed, ...task }) => db.update(
    tx => tx.updateRecord({
        ...task,
        attributes: {
            ...task.attributes,
            deleted: true,
            updatedAt: moment.utc().valueOf()
        }
    })
);


