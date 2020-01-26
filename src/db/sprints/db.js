import { db, genID, changes } from "../db";
import moment from "moment";

const dbSprints = db.sprints;

export { dbSprints, changes };

export const addSprint = async sprint => dbSprints.add({
    sprintID: genID(),
    createdAt: moment.utc().toDate(),
    ...sprint
});

export const deleteSprint = ({ sprintID }) => dbSprints.delete(sprintID);
