import { db } from "../db";

export const selectTodo = async task => {
    try {
        const todo = await db().todo.get("todo");
        return db().todo.put({ todoID: "todo", ...todo, taskID: task.taskID, tags: { all: true } });
    }
    catch (e) {
        return db().todo.put({ todoID: "todo", taskID: task.taskID, tags: { all: true } });
    }
}

export const dismissTodo = async () => {
    try {
        const { tags } = await db().todo.get("todo");
        return db().todo.put({ todoID: "todo", tags });
    }
    catch (e) {
        return db().todo.put({ todoID: "todo", tags: { all: true } });
    }
}

