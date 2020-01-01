import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
PouchDB.plugin(PouchDBFind);

export const dbSprints = new PouchDB('sprints');
export const dbTasks = new PouchDB('tasks');
export const dbTODOs = new PouchDB('todo');


dbTasks.createIndex({
    index: {
      fields: ["createdAt"]
    }
});

dbTasks.createIndex({
    index: {
      fields: ["done", "deleted"]
    }
});

async function activeTasksListener (fn, tags={all: true}) {

  const queryFields = [];
  const queryTagsSelector = {};
  for (let tag in tags) {
    const field = `tags.${tag}`;
    queryFields.push(field);
    queryTagsSelector[field] = true;
  }

  await dbTasks.createIndex({
    index: {
      fields: queryFields
    }
  });

  const tasks = (await dbTasks.find({
    selector: queryTagsSelector
  })).docs;

  fn(tasks);

  const taskChanges = dbTasks.changes({
    since: 'now',
    live: true,
    include_docs: true,
    filter: doc => {
      for (let tag in tags) {
        console.log("filter", doc, doc.tags[tag], tag, doc.tags);
        if (!doc.tags[tag]) {
          return false;
        }
      }

      return true;
    }
  }).on("change", async changes => {
    const changeTask = changes.doc;
    const index = tasks.findIndex(task => task._id === changeTask._id); 

    if (index === -1) {
      tasks.push(changeTask);
    }
    else if (changeTask.done || changeTask.deleted) {
      tasks.splice(index, 1);
    }
    else {
      // task was updated!
      tasks.splice(index, 1, task);
    }

    fn(tasks);
  });

  return () => taskChanges.cancel();
}

activeTasksListener(r => console.log("Calback ", r));

/**
 * https://github.com/baconjs/bacon.js#install
 * 
 * TODO:
 * 
 *  2. this way we can use find to select tags subsets.
 *  3. we can also add specific listeners to tags.
 *  4. and we can query sprints + tasks. 
 * 
 *  5. with this we can specify a tiny db api with listener and basic operations.
 *  6. the api should be defined with diferent layers even if its on diferent files:
 *      - db creation,
 *      - setup: indexes, views, ...
 *      - basic write/read apis
 *      - higth level listenners
 *      - hooks 
 * 
 */

