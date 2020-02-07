import Dexie from "dexie";

// import dexieObservable from "dexie-observable";
// import dexieSyncable from "dexie-syncable";
// import "dexie-observable";
// import "dexie-syncable";

// import sync from "./sync";
import uuidv4 from "uuid/v4";

// Dexie.Syncable.registerSyncProtocol("websocket", { sync });

export const db = new Dexie("taskroulette" /*, { addons: [dexieObservable, dexieSyncable] }*/);


db.version(1).stores({
	tasks: "&taskID,createdAt,updatedAt,description,tags,deleted,done,[deleted+done],_clientRev,_serverRev,_updatedAt",
	sprints: "&sprintID,createdAt,dueDate,tags",
	todo: "&todoID,taskID,tags"
});


db.tasks.hook("creating", function (primKey, obj, transaction) {
	obj._serverRev = 0;
	obj._clientRev = 0;
	obj._updatedAt = new Date().getTime();

	console.log(primKey, obj);

	return uuidv4();
});

db.tasks.hook("updating", function (modifications, primKey, obj, transaction) {

	obj._clientRev = obj._serverRev + 1;
	obj._updatedAt = new Date().getTime();

	console.log(modifications, primKey, obj);

});

function sync() {
	/*

		-> Client:
			- state != sync , send changes. 
		
		-> Server:
			- _rev > clientLastRev

		1) User creates a task:
			a) 

		--- clock C => (l, g) = (local, global) => (0, 0)

		1) Save sync time = C.
		2) For every client operation:
			- increment local clock,
			- save current C clock on changed record.

		2) Sync:
			- Client changes: every records where last sync local time is above clock.
			- Server changes: every records where last client sync global time is above clock.
		
			// keep sync clocks ranges:
			// Server [{start, end} ... ]
			// Client [{start, end} ... ]

			// Client will keep server and client time ranges to sync with server. 
			// 1. client can send changes in a arbitrary way but must keep track of messages sent.
			// 2. Server will receive a timestamp (vector clock) and send messages from there.  

			- when a client receives server changes some updated records may not need to be sent anymore.


			- Server, everytime 
	*/

}

export const genID = uuidv4;

const listenners = new Set();

/*
db.on("changes", changes => {
	for (let fn of listenners) {
		fn(changes);
	}
});
*/

export const changes = fn => {
	listenners.add(fn);

	return () => listenners.delete(fn);
};

/*
const url = `${process.env.REACT_APP_API_URL}/bayeux`;
console.log(url);
db.syncable.connect("websocket", url);

db.syncable.on("statusChanged", function (newStatus, url) {
	console.log("Sync Status changed: " + Dexie.Syncable.StatusTexts[newStatus], url);
});
*/
