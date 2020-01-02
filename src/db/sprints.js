import { useState, useEffect } from 'react';
import {dbTasks, dbSprints} from "./__db";

// === DB Sprints functions ===
export const addSprint = async sprint => {
    const r = await dbSprints.post(sprint);
    sprint._id = r.id;
    sprint._rev = r.rev;
    return sprint;
}

export const deleteSprint = async sprint => dbSprints.remove(sprint);

// --- Sprints 
export async function getActiveSprints () {
    // const sprints = await dbSprints.find();
    const sprints = await dbSprints.allDocs({
        include_docs: true
    });

    const tasks = await dbTasks.allDocs({
        include_docs: true
    });

    const now = new Date().getTime();
    const r = [];
    for (let i=0; i<sprints.rows.length; i++) {
        const sprint = {...sprints.rows[i].doc};
        r.push(sprint);

        sprint.tasks = [];
        sprint.doneTasks = [];
        sprint.deletedTasks = [];

        let avgTaskDoneTime;
        let oldestOpenTask = Infinity;
        let oldestTask = Infinity;
        let predictTaskDoneTime;

        for (let i=0; i<tasks.rows.length; i++) {
            const task = tasks.rows[i].doc;
            const isIn = sprint.tags.filter(tag => task.tags.includes(tag)).length === sprint.tags.length

            const createdAt = new Date(task.createdAt).getTime(); 
            oldestTask = oldestTask < createdAt?oldestTask:createdAt;

            if (isIn) {
                if (task.deleted) {
                    sprint.deletedTasks.push(task);
                }
                else if (task.done) {                    
                    sprint.doneTasks.push(task);
                }
                else if (task.createdAt) { // TODO: this is used to filter design docs, but not a good solution!!
                    const openCreatedAt = new Date(task.createdAt).getTime();
                    oldestOpenTask = oldestOpenTask < openCreatedAt?oldestOpenTask:openCreatedAt;
                    sprint.tasks.push(task);

                    const delta = now - createdAt;
                    predictTaskDoneTime = predictTaskDoneTime?(predictTaskDoneTime + delta) / 2:delta;
                }
            }
        }

        sprint.openTasksTotal = sprint.tasks.length;
        sprint.deletedTasksTotal = sprint.deletedTasks.length;
        sprint.doneTasksTotal = sprint.doneTasks.length;

        sprint.total = sprint.openTasksTotal + sprint.deletedTasksTotal + sprint.doneTasksTotal;

        sprint.avgTaskTime = (new Date(sprint.date).getTime() - new Date().getTime()) / sprint.openTasksTotal;

        predictTaskDoneTime = predictTaskDoneTime || sprint.avgTaskTime;
        if (sprint.doneTasks.length === 0) {
            avgTaskDoneTime = predictTaskDoneTime;
        }
        else if (predictTaskDoneTime) {
            avgTaskDoneTime = ((now - oldestTask) + predictTaskDoneTime) / (sprint.doneTasks.length + 1);
        }

        sprint.avgTaskDoneTime = avgTaskDoneTime;
        sprint.nextTODOTime = (sprint.avgTaskTime + sprint.avgTaskDoneTime) / 2;
        sprint.oldestOpenTask = oldestOpenTask;

        sprint.expectedDueDate = now + sprint.tasks.length * avgTaskDoneTime;
    }

    return r;
}

export function subscribeActiveSprints (fn) {
    let listener;

    getActiveSprints().then(fn);

    listener = dbSprints.changes({
        since: 'now',
        live: true,
        include_docs: true
    })
    .on("change", async () => {
        fn(await getActiveSprints());
    });

    return () => listener.cancel();
}

// === Hooks,
export const useActiveSprints = () => {
    const [sprints, setSprints] = useState([]);
  
    const handleSprintsChange = sprints => {
        setSprints(sprints);
    }

    useEffect(
        () => subscribeActiveSprints(handleSprintsChange), 
        [true]
    );
  
    return {
        sprints,
        addSprint,
        deleteSprint
    };
}
