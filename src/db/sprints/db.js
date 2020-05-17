import { db, changes, onReady, refreshTime } from "../db";
import moment from "moment";

export { db, changes, onReady, refreshTime };

export const addSprint = async ({ dueDate, tags }) => {
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
                createdAt: moment.valueOf(),
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
