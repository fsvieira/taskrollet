import {dbTodo, selectTodo} from "./db";
import {$activeTasks, $activeTags} from "../tasks/streams";
import {fromBinder} from "baconjs"

export const $todo = () =>
    fromBinder(async sink => {
        const todoChanges = dbTodo.changes({
          since: 'now',
          live: true,
          include_docs: true,
          filter: todo => todo._id === 'todo' 
        }).on("change", ({doc: todo}) =>
          sink(todo)
        );
    
        try {
            sink(await dbTodo.get("todo"));
        }
        catch (e) {
            sink({tags: {all: true}});
        }
    
        return () => todoChanges.cancel();
    });  

export const $activeTodo = () => 
    $todo().combine($activeTasks(), (todo, tasks) => {
        console.log(todo, tasks);
        const t = {...todo};

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


