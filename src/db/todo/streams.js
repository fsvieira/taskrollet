import { dbTodo, selectTodo, setTodoFilterTags } from "./db";
// import {$activeTasks} from "../tasks/streams";
import { $activeSprintsTasks } from "../sprints/streams";
import { fromBinder } from "baconjs"
import moment from "moment";

export const $todo = () =>
    fromBinder(sink => {
        const todoChanges = dbTodo.changes({
            since: 'now',
            live: true,
            include_docs: true,
            filter: todo => todo._id === 'todo'
        }).on("change", ({ doc: todo }) =>
            sink(todo)
        );

        dbTodo.get("todo").then(
            sink,
            () => sink({ tags: { all: true } })
        );

        return () => todoChanges.cancel();
    });

export const $activeTodo = tags =>
    $todo().combine($activeSprintsTasks(tags), (todo, { sprints, tasks }) => {
        const t = { ...todo };

        if (tasks.length === 0 && Object.keys(todo.tags).length > 1) {
            setTodoFilterTags({ all: true });
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
            // t.task = tasks[Math.floor(Math.random() * tasks.length)];
            const now = moment().valueOf();
            let total = 0;
            for (let i = 0; i < tasks.length; i++) {
                const task = tasks[i];
                const rank = task.computed.sprints.length
                    + (now - moment(task.createdAt).valueOf())
                    + task.computed.sprints.reduce((acc, sprint) => {
                        return acc + sprint.doneAvg - sprint.taskDueAvg
                    }, 0)
                    ;

                total += rank;
                task.computed.rank = rank;
            }

            tasks.forEach(task => {
                task.computed.rank = task.computed.rank / total;
            });

            tasks.sort((a, b) => a.computed.rank - b.computed.rank);

            const r = Math.random();

            let accum = 0;
            for (let i = 0; i < tasks.length; i++) {
                const task = tasks[i];
                const a = accum + task.computed.rank;
                if (a >= r) {
                    t.task = task;
                    selectTodo(task, tags);
                    break;
                }
                else {
                    accum = a;
                }
            }
        }

        return t;
    });


