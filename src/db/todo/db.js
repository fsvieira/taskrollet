import { db, changes } from "../db";

export { db, changes };


export const selectTodo = async task => {
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

    /*
    try {
        const todo = await dbTodo.get("todo");
        return dbTodo.put({ todoID: "todo", ...todo, taskID: task.taskID, tags: { all: true } });
    }
    catch (e) {
        return dbTodo.put({ todoID: "todo", taskID: task.taskID, tags: { all: true } });
    }*/
    // try {
    // console.log("Select todo");
    /*
    const todo = await db.query(
        q => q.findRecord({ type: "todo", id: "todo" })
    ).then(
        todo => console.log("Found TODO: ", todo),
        err => console.log("Error TODO: ", err)
    );
 
    return todo;*/
    // return { todoID: "todo", taskID: task.taskID, tags: { all: true } };

    /*
        return dbTodo.put({ id: "todo", ...todo, taskID: task.taskID, tags: { all: true } });
    }
    catch (e) {
        return dbTodo.put({ todoID: "todo", taskID: task.taskID, tags: { all: true } });
    }*/
}

export const dismissTodo = async () => {
    /*
    try {
        const { tags } = await dbTodo.get("todo");
        return dbTodo.put({ todoID: "todo", tags });
    }
    catch (e) {
        return dbTodo.put({ todoID: "todo", tags: { all: true } });
    }*/
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

