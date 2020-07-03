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
    ]);    /*    if (task.doneUntil) {
            await doneTaskUntil(task)
        }*/

    /*
try {
    await resetTask(task);

    const { _id, _rev } = await dbTodo.get("todo");
    return dbTodo.put({ _id, _rev, task: task._id });
}
catch (e) {
    return dbTodo.put({ _id: "todo", task: task._id });
}*/
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

