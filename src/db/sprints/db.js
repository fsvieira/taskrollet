import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import {fromBinder} from "baconjs"

PouchDB.plugin(PouchDBFind);

export const dbSprints = new PouchDB('sprints');

/**
 *  Stream listeners 
 */


export function $activeSprints () {
  return fromBinder(async sink => {
    const sprintChanges = dbSprints.changes({
      since: 'now',
      live: true,
      include_docs: true
    }).on("change", ({doc}) => sink(doc));

    (await dbSprints.allDocs({
      include_docs: true
    })).rows.forEach(sink);
  
    return () => sprintChanges.cancel();
  });
}

function $activeSprintsTasks () {
  return $activeSprints().combine(
    $tasks(null, {deleted: null} /* TODO: stats with no more then 3 months from now, createdAt: {$gt: }} */
  ), (sprint, tasks) => {
      return {sprint, tasks};
    }
  );
}


// $activeSprintsTasks().log();

