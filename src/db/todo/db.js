import { db, changes } from "../db";

const dbTodo = db.todo;

export { dbTodo, changes };


export const selectTodo = async task => {
    try {
        const todo = await dbTodo.get("todo");
        return dbTodo.put({ todoID: "todo", ...todo, taskID: task.taskID, tags: { all: true } });
    }
    catch (e) {
        return dbTodo.put({ todoID: "todo", taskID: task.taskID, tags: { all: true } });
    }
}

export const dismissTodo = async () => {
    try {
        const { tags } = await dbTodo.get("todo");
        return dbTodo.put({ todoID: "todo", tags });
    }
    catch (e) {
        return dbTodo.put({ todoID: "todo", tags: { all: true } });
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

