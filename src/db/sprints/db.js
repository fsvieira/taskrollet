import { db, changes, refreshTime } from "../db";
import moment from "moment";

export { db, changes, refreshTime };

export const addSprint = async ({ dueDate, tags }) => {
    debugger;
    const nTags = [];

    for (let tag in tags) {
        if (tags[tag]) {
            nTags.push(tag);
        }
    }

    nTags.push("all");

    return (await db()).update(
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

export const deleteSprint = async ({ type, id }) => (await db()).update(
    tx => tx.removeRecord({ type, id })
);
