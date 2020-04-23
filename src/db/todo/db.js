import { db, changes } from "../db";
import { doneTaskUntil } from "../tasks/db"

export { db, changes };

export const selectTodo = async task => {
    if (task.doneUntil) {
        await doneTaskUntil(task)
    }

    return db.update(tx => [
        tx.addRecord({
            type: "todo",
            id: "todo",
            relationships: {
                task: { type: "task", id: task.id },
                tags: {
                    data: [
                        { type: "tag", id: "all" }
                    ]
                }
            }
        })
    ]);
}

export const dismissTodo = async () => {
    try {
        const todo = await db.query(q => q.findRecord({ type: "todo", id: "todo" }));

        console.log("TODO: ", todo);

        return db.update(tx => [
            tx.addRecord({
                type: "todo",
                id: "todo",
                relationships: {
                    tags: {
                        data: todo.relationships.tags.data
                    }
                }
            })
        ]);
    }
    catch (e) {
        return db.update(tx => [
            tx.addRecord({
                type: "todo",
                id: "todo",
                relationships: {
                    tags: {
                        data: [
                            { type: "tag", id: "all" }
                        ]
                    }
                }
            })
        ]);
    }
}

export const setTodoFilterTags = async tags => {
    try {
        // remove strange values before going to db,
        for (let tag in tags) {

            if (!tags[tag]) {
                delete tags[tag];
            }
            else {
                tags[tag] = !!tags[tag];
            }
        }

        const todo = await dbTodo.get("todo");
        return dbTodo.put({ todoID: "todo", ...todo, tags });
    }
    catch (e) {
        return dbTodo.put({ todoID: "todo", tags });
    }
}

