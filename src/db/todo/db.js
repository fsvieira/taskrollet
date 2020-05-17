import { db, changes, onReady, refreshTime } from "../db";
import { doneTaskUntil } from "../tasks/db"

export { db, changes, onReady, refreshTime };

export const selectTodo = async task => {
    if (task.attributes.doneUntil) {
        await doneTaskUntil(task, null)
    }

    return db.update(tx => [
        tx.addRecord({
            type: "todo",
            id: "todo",
            relationships: {
                task: { type: "task", id: task.id }
            }
        })
    ]);
}

export const dismissTodo = async () => {
    return db.update(tx => [
        tx.addRecord({
            type: "todo",
            id: "todo",
            relationships: {
                task: null
            }
        })
    ]);
}

