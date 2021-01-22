import { db, changes } from "../db";
import { selectTodo } from "./db";
import { $activeSprintsTasks } from "../sprints/streams";
import { fromBinder } from "baconjs"
import moment from "moment";

export const $todo = () =>
    fromBinder(sink => {
        const find = () => db().todo.get("todo").then(
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

let selectedTasks = [];

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

export const $activeTodo = tags =>
    $todo().combine($activeSprintsTasks(tags), (todo, { sprints, tasks }) => {
        const t = { ...todo };

        if (tasks.length === 0) {
            tags = { all: true };
        }

        if (selectedTasks.length > 10) {
            selectedTasks.shift();
        }

        if (t.taskID) {
            const task = tasks.find(task => task.taskID === t.taskID);

            const dateUntil = t.task && t.task.doneUntil && moment(t.task.doneUntil).isAfter(moment())
                ? moment(t.task.doneUntil).calendar() : undefined;

            if (!task || task.deleted || task.done || dateUntil) {
                const index = selectedTasks.indexOf(t.taskID);

                if (index !== -1) {
                    selectedTasks.splice(index, 1);
                }

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

            if (tasks.filter(t => !selectedTasks.includes(t.id)).length === 0) {
                selectedTasks = [];
            }

            for (let i = 0; i < tasks.length; i++) {
                const task = tasks[i];

                const sprintLength = task.computed.sprints.length;
                const time = now - task.createdAt;
                const sprintAvg = task.computed.sprints.reduce((acc, sprint) =>
                    acc + Math.abs(sprint.doneAvg - sprint.taskDueAvg)
                    , 0
                );

                const rank = selectedTasks.includes(task.id) ? 0 : sprintLength + time + sprintAvg;

                total += rank;
                task.computed.rank = rank;
            }

            tasks.forEach(task => {
                task.computed.rank = task.computed.rank / total;
            });

            tasks = shuffle(tasks);

            const r = Math.random();
            let accum = 0;

            for (let i = 0; i < tasks.length; i++) {
                const task = tasks[i];

                const a = accum + task.computed.rank;

                if (a >= r) {
                    t.task = task;
                    t.taskID = task.taskID;
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


