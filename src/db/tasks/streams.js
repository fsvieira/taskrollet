import {dbTasks} from "./db";
import {fromBinder} from "baconjs"

export const $tasks = (tags={all: true}, selector) =>
    fromBinder(sink => {
        let {done, deleted} = selector || {
            done: false,
            deleted: false
        };

        done = done===undefined?undefined:!!done;
        deleted = deleted===undefined?undefined:!!deleted;

        async function find () {
            const docs = await dbTasks.allDocs({include_docs: true});

            const tasks = docs.rows.map(({doc}) => doc).filter(task => {
                if (!task.tags) return false;
                
                const taskDone = !!task.done;
                const taskDeleted = !!task.deleted;

                if (done !== undefined && taskDone !== done) {
                    return false;
                }

                if (deleted !== undefined && taskDeleted !== deleted) {
                    return false;
                }

                for (let tag in tags) {
                    if (!task.tags[tag]) {
                        return false;
                    }
                }

                return true;
            });

            return tasks; 
        };

        const taskChanges = dbTasks.changes({
            since: 'now',
            live: true,
            include_docs: true
        }).on("change", () => find().then(sink));

        find().then(sink);
    
        return () => taskChanges.cancel();
    });
  
export const $activeTasks = tags => $tasks(tags, {done: null, deleted: null});

export const $activeTags = () => $activeTasks().map(tasks => {
    const tags = {};
    for (let i=0; i<tasks.length; i++) {
        const task = tasks[i];
        for (let tag in task.tags) {
            tags[tag] = true;
        }
    }

    return tags;
});
  
