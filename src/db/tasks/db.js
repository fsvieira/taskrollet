import { db, genID, changes, onReady } from "../db";
import moment from "moment";

export { db, changes, onReady };

export const addTask = ({ computed, tags, ...task }, createdAt) => {
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
            attributes: {
                ...task.attributes,
                done: false,
                deleted: false,
                createdAt: createdAt || now,
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

export const editTask = ({ computed, tags, ...task }) => {
    const now = moment.utc().toDate();

    const nTags = [];

    for (let tag in tags) {
        if (tags[tag]) {
            nTags.push(tag);
        }
    }

    console.log("TASK ID", task.id);

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
    tx => tx.updateRecord({
        type: "task",
        id: task.id,
        attributes: {
            ...task.attributes,
            done: true,
            updatedAt: moment().toDate()
        },
        relationships: task.relationships
    })
);

export const doneTaskUntil = ({ computed, ...task }, doneUntil) => {
    console.log({
        id: task.id,
        attributes: {
            ...task.attributes,
            doneUntil,
            updatedAt: moment().toDate()
        },
        relationships: task.relationships
    });

    return db.update(
        tx => tx.updateRecord({
            type: "task",
            id: task.id,
            attributes: {
                ...task.attributes,
                doneUntil,
                updatedAt: moment().toDate()
            },
            relationships: task.relationships
        })
    )
};

export const deleteTask = ({ computed, ...task }) => db.update(
    tx => tx.updateRecord({
        type: "task",
        id: task.id,
        attributes: {
            ...task.attributes,
            deleted: true,
            updatedAt: moment().toDate()
        },
        relationships: task.relationships
    })
);


