import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

PouchDB.plugin(PouchDBFind);

export const dbSprints = new PouchDB('sprints');

export const addSprint = async sprint => {
    const r = await dbSprints.post(sprint);
    sprint._id = r.id;
    sprint._rev = r.rev;
    return sprint;
}

export const deleteSprint = ({_id, _rev}) => dbSprints.remove({_id, _rev});
