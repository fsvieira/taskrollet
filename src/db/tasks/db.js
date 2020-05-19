import { db, changes, refreshTime } from "../db";
import moment from "moment";

export { db, changes, refreshTime };

export const addTask = async ({ computed, ...task }, createdAt) => {
    const now = moment.utc().valueOf();

    return (await db()).update(tx => [
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

export const editTask = async ({ computed, ...task }) => {
    const now = moment.utc().valueOf();

    return (await db()).update(tx => [
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

export const doneTask = async ({ computed, ...task }) => (await db()).update(
    tx => tx.updateRecord({
        ...task,
        attributes: {
            ...task.attributes,
            done: true,
            updatedAt: moment.utc().valueOf()
        }
    })
);

export const doneTaskUntil = async ({ computed, ...task }, doneUntil) => {
    return (await db()).update(
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

export const deleteTask = async ({ computed, ...task }) => (await db()).update(
    tx => tx.updateRecord({
        ...task,
        attributes: {
            ...task.attributes,
            deleted: true,
            updatedAt: moment.utc().valueOf()
        }
    })
);


