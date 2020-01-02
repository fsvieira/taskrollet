import {dbTasks} from "./db";
import {fromBinder} from "baconjs"

export const $tasks = (tags={all: true}, selector) => 
    fromBinder(sink => {
        const queryFields = [];
        const queryTagsSelector = selector || {
            done,
            deleted,
        };
    
        for (let tag in tags) {
            const field = `tags.${tag}`;
            queryFields.push(field);
            queryTagsSelector[field] = true;
        }
    
        dbTasks.createIndex({
            index: {
            fields: queryFields
            }
        });
    
        const taskChanges = dbTasks.changes({
            since: 'now',
            live: true,
            include_docs: true
        }).on("change", async () => 
            sink((await dbTasks.find({
            selector: queryTagsSelector
            })).docs)
        );
    
        /*
        sink((await dbTasks.find({
            selector: queryTagsSelector
        })).docs);*/

        dbTasks.find({
            selector: queryTagsSelector
        }).then(({docs}) => sink(docs));
    
        return () => taskChanges.cancel();
    });
  
export const $activeTasks = tags => $tasks(tags, {done: null, deleted: null});

export const $activeTags = () => $activeTasks().scan({}, (tags, tasks) => {
      for (let i=0; i<tasks.length; i++) {
        const task = tasks[i];
        for (let tag in task.tags) {
          tags[tag] = true;
        }
      }
  
      return tags;
    });
  
