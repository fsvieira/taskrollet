import { db, selectTodo, changes, refreshTime } from "./db";
import { $activeSprintsTasks } from "../sprints/streams";
import { fromBinder } from "baconjs"
import moment from "moment";

export const $todo = () =>
    fromBinder(sink => {
        const find = cache => db(cache).then(
            async db => {
                try {
                    const todo = await db.query(q => q.findRecord({ type: "todo", id: "todo" }));
                    sink(todo);
                }
                catch (err) {
                    db.requestQueue && db.requestQueue.skip();

                    sink({
                        relationships: {
                            tags: {
                                data: [{ type: "tag", id: "all" }]
                            }
                        }
                    })
                }
            }
        );

        const cancel = changes(() => find(true));

        find();

        const cancelInterval = setInterval(() => find(), refreshTime);

        return () => {
            clearInterval(cancelInterval);
            return cancel();
        }
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

        if (t.relationships.task) {
            const task = tasks.find(task => task.id === t.relationships.task.id);

            const dateUntil = t.task && t.task.doneUntil && moment(t.task.doneUntil).isAfter(moment())
                ? moment(t.task.doneUntil).calendar() : undefined;

            if (!task || task.deleted || task.done || dateUntil) {
                const index = selectedTasks.indexOf(t.relationships.task.id);

                if (index !== -1) {
                    selectedTasks.splice(index, 1);
                }

                delete t.relationships.task;
            }
            else {
                t.relationships.task = task;
            }

            t.total = tasks.length;
        }

        if (!t.relationships.task && tasks.length) {
            const now = moment().valueOf();
            let total = 0;

            if (tasks.filter(t => !selectedTasks.includes(t._id)).length === 0) {
                selectedTasks = [];
            }

            for (let i = 0; i < tasks.length; i++) {
                const task = tasks[i];

                const sprintLength = task.computed.sprints.length;
                const time = now - task.attributes.createdAt;
                const sprintAvg = task.computed.sprints.reduce((acc, sprint) =>
                    acc + Math.abs(sprint.attributes.doneAvg - sprint.attributes.taskDueAvg)
                    , 0
                );

                const rank = selectedTasks.includes(task.id) ? 0 : sprintLength + time + sprintAvg;

                total += rank;
                task.computed.rank = rank;
            }

            tasks.forEach(task => {
                task.computed.rank = task.computed.rank / total;
            });

            // tasks.sort((a, b) => a.computed.rank - b.computed.rank);
            tasks = shuffle(tasks);

            const r = Math.random();

            let accum = 0;
            for (let i = 0; i < tasks.length; i++) {
                const task = tasks[i];

                const a = accum + task.computed.rank;

                if (a >= r) {
                    t.relationships.task = task;
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


