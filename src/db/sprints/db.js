import { db, changes, onReady } from "../db";
import moment from "moment";

export { db, changes, onReady };

export const addSprint = async ({ dueDate, tags }) => {
    console.log(dueDate, tags);

    const nTags = [];

    for (let tag in tags) {
        if (tags[tag]) {
            nTags.push(tag);
        }
    }

    nTags.push("all");

    return db.update(
        tx => tx.addRecord({
            type: "sprint",
            attributes: {
                createdAt: moment.utc().toDate(),
                dueDate
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
    );
};

export const deleteSprint = ({ type, id }) => db.update(
    tx => tx.removeRecord({ type, id })
);
