import { db, changes } from "../db";
import moment from "moment";

export { db, changes };

export const addSprint = async sprint => db.update(
    tx => tx.addRecord({
        createdAt: moment.utc().toDate(),
        ...sprint
    })
);

export const deleteSprint = ({ type, id }) => db.update(
    tx => tx.removeRecord({ type, id })
);
