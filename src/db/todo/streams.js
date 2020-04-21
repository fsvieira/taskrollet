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

let selectedTasks = [];

export const $activeTodo = tags =>
    $todo().combine($activeSprintsTasks(tags), (todo, { sprints, tasks }) => {
        const t = { ...todo };

        if (tasks.length === 0 && Object.keys(todo.tags).length > 1) {
            console.log("There is no tasks!");
            setTodoFilterTags({ all: true });
        }

        if (selectedTasks.length > 10) {
            selectedTasks.shift();
        }

        if (t.task) {
            console.log("There is alredy a selected task", t.task);

            const task = tasks.find(task => task._id === t.task);

            if (selectedTasks.indexOf(t.task) === -1) {
                selectedTasks.push(t.task);
            }

            const dateUntil = t.task && t.task.doneUntil && moment(t.task.doneUntil).isAfter(moment())
                ? moment(t.task.doneUntil).calendar() : undefined;

            if (!task || task.deleted || task.done || dateUntil) {
                console.log("Tasks is no longer available", dateUntil);

                const index = selectedTasks.indexOf(t.task);

                if (index !== -1) {
                    selectedTasks.splice(index, 1);
                }

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

            if (tasks.filter(t => !selectedTasks.includes(t._id)).length === 0) {
                selectedTasks = [];
            }

            for (let i = 0; i < tasks.length; i++) {
                const task = tasks[i];
                const sprintLength = task.computed.sprints.length;
                const time = (now - moment(task.createdAt).valueOf());
                const sprintAvg = task.computed.sprints.reduce((acc, sprint) => {
                    console.log("Sprint Calcs: ", sprint.doneAvg, sprint.taskDueAvg);
                    return acc + Math.abs(sprint.doneAvg - sprint.taskDueAvg)
                }, 0);

                const rank = selectedTasks.includes(task._id) ? 0 : sprintLength + time + sprintAvg;

                console.log(sprintLength, time, sprintAvg);

                total += rank;
                task.computed.rank = rank;
            }

            selectedTasks.shift();

            tasks.forEach(task => {
                task.computed.rank = task.computed.rank / total;
            });

            tasks.sort((a, b) => a.computed.rank - b.computed.rank);

            const r = Math.random();

            console.log("Select", tasks, r);

            let accum = 0;
            for (let i = 0; i < tasks.length; i++) {
                const task = tasks[i];
                const a = accum + task.computed.rank;

                console.log(a, a >= r, task);

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

        console.log(selectedTasks, t, selectedTasks.includes(t.task._id));

        console.log("Return", t);
        return t;
    });


