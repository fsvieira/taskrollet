import { db, genID } from "../db";
import moment from "moment";

export const addSprint = async sprint => db().sprints.add({
    sprintID: genID(),
    createdAt: moment.utc().toDate(),
    ...sprint
});

export const deleteSprint = ({ sprintID }) => db().sprints.delete(sprintID);