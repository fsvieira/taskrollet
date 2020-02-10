import { db, selectTodo, setTodoFilterTags, changes } from "./db";
import { $activeSprintsTasks } from "../sprints/streams";
import { fromBinder } from "baconjs"
import moment from "moment";

export const $todo = () =>
    fromBinder(sink => {
        const find = () => db.query(q => q.findRecord({ type: "todo", id: "todo" })).then(
            todo => {
                if (todo) {
                    sink(todo);
                }
                else {
                    sink({ tags: { all: true } });
                }
            }
        );

        const cancel = changes(find);

        find();

        return cancel;
    });

export const $activeTodo = tags =>
    $todo().combine($activeSprintsTasks(tags), (todo, { sprints, tasks }) => {
        const t = { ...todo };

        if (tasks.length === 0 && Object.keys(todo.tags).length > 1) {
            setTodoFilterTags({ all: true });
        }

        if (t.taskID) {
            const task = tasks.find(task => task.taskID === t.taskID);

            if (!task || task.deleted || task.done) {
                delete t.taskID;
                delete t.task;
            }
            else {
                t.task = task;
            }

            t.total = tasks.length;
        }

        if (!t.taskID && tasks.length) {
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
                    t.taskID = task.taskID;
                    selectTodo(task);
                    break;
                }
                else {
                    accum = a;
                }
            }
        }

        return t;
    });


