import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
PouchDB.plugin(PouchDBFind);

export const dbSprints = new PouchDB('sprints');
export const dbTasks = new PouchDB('tasks');
export const dbTODOs = new PouchDB('todo');


dbTasks.createIndex({
    index: {
      fields: ['createdAt']
    }
});

dbTasks.createIndex({
    index: {
      fields: ['done', 'deleted']
    }
});

/**
 * TODO:
 * 
 *  1. replace all tags array to an object,
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

