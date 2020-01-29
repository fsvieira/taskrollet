import Dexie from "dexie";

// import dexieObservable from "dexie-observable";
// import dexieSyncable from "dexie-syncable";
import "dexie-observable";
import "dexie-syncable";

import sync from "./sync";
import uuidv4 from "uuid/v4";

Dexie.Syncable.registerSyncProtocol("websocket", { sync });

export const db = new Dexie("taskroulette" /*, { addons: [dexieObservable, dexieSyncable] }*/);


db.version(1).stores({
	tasks: "&taskID,createdAt,updatedAt,description,tags,deleted,done,[deleted+done]",
	sprints: "&sprintID,createdAt,dueDate,tags",
	todo: "&todoID,taskID,tags"
});

export const genID = uuidv4;

const listenners = new Set();

db.on("changes", changes => {
	for (let fn of listenners) {
		fn(changes);
	}
});

export const changes = fn => {
	listenners.add(fn);

	return () => listenners.delete(fn);
};

const url = `${process.env.REACT_APP_API_URL}/bayeux`;
console.log(url);
db.syncable.connect("websocket", url);

db.syncable.on("statusChanged", function (newStatus, url) {
	console.log("Sync Status changed: " + Dexie.Syncable.StatusTexts[newStatus], url);
});