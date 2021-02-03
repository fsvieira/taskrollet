import Dexie from "dexie";

import dexieObservable from "dexie-observable";
import dexieSyncable from "dexie-syncable";
import uuidv4 from "uuid/v4";
import sync from './sync/sync';

Dexie.Syncable.registerSyncProtocol("websocket", { sync });

const dbName = "taskroulette";

let _db;
export const genID = uuidv4;

const listenners = new Set();

export async function startSync(token) {
	try {
		console.log("Start Sync");
		db().syncable.disconnect(process.env.REACT_WS_SYNC);

		await db().syncable.connect(
			"websocket",
			process.env.REACT_WS_SYNC,
			{ token }
		);
	} catch (e) {
		console.log(e);
	}
}

function setup() {

	try {
		const db = new Dexie(dbName, { addons: [dexieObservable, dexieSyncable] });

		db.version(1).stores({
			tasks: "&taskID,createdAt,updatedAt,description,tags,deleted,done,doneUntil,[deleted+done]",
			sprints: "&sprintID,createdAt,dueDate,tags",
			todo: "&todoID,taskID,filterTags",
			user: "&userID,email,expirationDate,userID,username"
		});

		db.version(2).stores({});

		db.on("changes", changes => {
			for (let fn of listenners) {
				fn(changes);
			}
		});

		db.syncable.on('statusChanged', (newStatus, url) => {
			console.log("Sync Status changed: " + Dexie.Syncable.StatusTexts[newStatus]);
		});

		return db;
	}
	catch (e) {
		console.log(e);
	}
}

export function db() {
	if (!_db) {
		_db = setup();
	}

	return _db;
}

export async function clear() {
	localStorage.clear();
	sessionStorage.clear();
	indexedDB.deleteDatabase(dbName);
};


export const changes = fn => {
	listenners.add(fn);

	return () => listenners.delete(fn);
};