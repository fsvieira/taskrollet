import { db, genID, changes } from "../db";
import moment from "moment";

export { db, changes };

export const addTask = ({ computed, tags, ...task }) => {
    const now = moment.utc().toDate();
    const nTags = [];

    for (let tag in tags) {
        if (tags[tag]) {
            nTags.push(tag);
        }
    }

    return db.update(tx => [
        ...nTags.map(tag => (tx.addRecord({
            type: "tag",
            id: tag
        }))),
        tx.addRecord({
            type: "task",
            id: genID(),
            attributes: {
                ...task.attributes,
                done: false,
                deleted: false,
                createdAt: now,
                updatedAt: now
            },
            relationships: {
                tags: {
                    data: nTags.map(
                        tag => ({
                            type: "tag",
                            id: tag
                        })
                    )
                }
            }
        })
    ]);
}

/*
export const editTask = ({ computed, ...task }) => db.update(
    tx => tx.updateRecord({ ...task, updatedAt: moment().toDate() })
);*/

export const editTask = ({ computed, tags, ...task }) => {
    const now = moment.utc().toDate();

    console.log("Update Task => ", task);

    const nTags = [];

    for (let tag in tags) {
        if (tags[tag]) {
            nTags.push(tag);
        }
    }

    console.log("TASK ID => ", task.id);

    return db.update(tx => [
        ...nTags.map(tag => (tx.addRecord({
            type: "tag",
            id: tag
        }))),
        tx.updateRecord({
            type: "task",
            id: task.id,
            attributes: {
                ...task.attributes,
                updatedAt: now
            },
            relationships: {
                tags: {
                    data: nTags.map(
                        tag => ({
                            type: "tag",
                            id: tag
                        })
                    )
                }
            }
        })
    ]);
}

export const doneTask = ({ computed, ...task }) => db.update(
    tx => tx.updateRecord({ ...task, done: true, updatedAt: moment().toDate() })
);

export const deleteTask = ({ computed, ...task }) => db.update(
    tx => tx.updateRecord({ ...task, deleted: true, updatedAt: moment().toDate() })
);
