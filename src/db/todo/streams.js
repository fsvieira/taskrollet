import {dbTodo, selectTodo, setTodoFilterTags} from "./db";
import {$activeTasks} from "../tasks/streams";
import {fromBinder} from "baconjs"

export const $todo = () =>
    fromBinder(sink => {
        const todoChanges = dbTodo.changes({
          since: 'now',
          live: true,
          include_docs: true,
          filter: todo => todo._id === 'todo' 
        }).on("change", ({doc: todo}) =>
          sink(todo)
        );
    
        dbTodo.get("todo").then(
            sink,
            () => sink({tags: {all: true}})
        );
    
        return () => todoChanges.cancel();
    });  

export const $activeTodo = (tags) => 
    $todo().combine($activeTasks(tags), (todo, tasks) => {
        const t = {...todo};

        if (tasks.length === 0 && Object.keys(todo.tags).length > 1) {
            setTodoFilterTags({all: true});
        }

        if (t.task) {
            const task = tasks.find(task => task._id === t.task);

            if (!task || task.deleted || task.done) {
                delete t.task;
            }
            else {
                t.task = task;
            }

            t.total = tasks.length;
        }

        if (!t.task && tasks.length) {
            t.task = tasks[Math.floor(Math.random() * tasks.length)];
            selectTodo(t.task);
        }
        
        return t;
    });


