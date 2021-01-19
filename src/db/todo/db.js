import { db, changes, refreshTime } from "../db";
import { resetTask } from "../tasks/db"

export { db, changes, refreshTime };

export const selectTodo = async task => {
    /*console.log("SELECT TODO");

    if (task.attributes.doneUntil) {
        await doneTaskUntil(task, null)
    }*/

    console.log("SELECT TODO");

    await resetTask(task);

    return (await db()).update(tx => [
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
    return (await db()).update(tx => [
        tx.addRecord({
            type: "todo",
            id: "todo",
            relationships: {
                task: null
            }
        })
    ]);
}

