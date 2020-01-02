import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

PouchDB.plugin(PouchDBFind);

export const dbTodo = new PouchDB('todo');

export const selectTodo = async task => {
    try {
        const todo = await dbTodo.get("todo");
        return dbTodo.put({...todo, task: task._id});
    }
    catch (e) {
        console.log(e);
        return dbTodo.put({_id: "todo", task: task._id});
    }
}

export const dimissTodo = async () => {
    try {
        const todo = await dbTodos.get("todo");
        return dbTodo.put({tags: todo.tags});
    }
    catch (e) {
        return dbTodo.put({tags: {all: true}});
    }
}

export const setTodoFilterTags = async tags => {
    try {
        const todo = await dbTodos.get("todo");
        return dbTodo.put({...todo, tags});
    }
    catch (e) {
        return dbTodo.put({tags});
    }
}
