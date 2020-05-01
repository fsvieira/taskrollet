import { Schema } from "@orbit/data";
import IndexedDBSource from "@orbit/indexeddb";
import MemorySource from "@orbit/memory";
import Coordinator, { SyncStrategy, RequestStrategy } from "@orbit/coordinator";
import { uuid } from "@orbit/utils";
import JSONAPISource from "@orbit/jsonapi";

/**
 * Schema
 */
const schema = new Schema({
	models: {
		task: {
			attributes: {
				description: { type: "string" },
				done: { type: "boolean" },
				deleted: { type: "boolean" },
				doneUntil: { type: "date-time" },
				createdAt: { type: "date-time" },
				updatedAt: { type: "date-time" }
			},
			relationships: {
				tags: { type: "hasMany", model: "tag" /*, inverse: "task"*/ }
			}
		},
		tag: {},
		sprint: {
			attributes: {
				createdAt: { type: "date-time" },
				dueDate: { type: "date-time" },
			},
			relationships: {
				tags: { type: "hasMany", model: "tag" /*, inverse: "sprint"*/ }
			}
		},
		todo: {
			relationships: {
				tags: { type: "hasMany", model: "tag" /*, inverse: "todo"*/ },
				task: { type: "hasOne", model: "task" }
			}
		}
	}
});

/**
 * Sources,
 */
const db = new MemorySource({ schema });

const backup = new IndexedDBSource({
	schema,
	name: "backup",
	namespace: "taskroulette"
});

const remote = new JSONAPISource({
	schema,
	name: "remote",
	host: "http://localhost:9000/api/fsvieira"
});

/**
 * Tranform backup sync
 */
db.on("transform", transform => {
	backup.sync(transform);

	console.log("TRASNFORM -> " + JSON.stringify(transform));
	listenners.forEach(fn => fn());
});

/**
 * Coordinator
 */
const coordinator = new Coordinator({
	sources: [db, backup, remote]
});

const backupMemorySync = new SyncStrategy({
	source: "memory",
	target: "backup",
	blocking: true
});

coordinator.addStrategy(backupMemorySync);

// Query the remote server whenever the memory source is queried
coordinator.addStrategy(
	new RequestStrategy({
		source: "memory",
		on: "beforeQuery",

		target: "remote",
		action: "query",

		blocking: false
	})
);

// Update the remote server whenever the memory source is updated
coordinator.addStrategy(
	new RequestStrategy({
		source: "memory",
		on: "beforeUpdate",

		target: "remote",
		action: "update",

		blocking: false
	})
);

/*
// Query the remote server whenever the memory source is queried
coordinator.addStrategy(
	new RequestStrategy({
		source: "memory",
		on: "beforeQuery",

		target: "remote",
		action: "pull",

		blocking: true
	})
);

// Update the remote server whenever the memory source is updated
coordinator.addStrategy(
	new RequestStrategy({
		source: "memory",
		on: "beforeUpdate",

		target: "remote",
		action: "push",

		blocking: true
	})
);
*/

// Sync all changes received from the remote server to the memory source
coordinator.addStrategy(
	new SyncStrategy({
		source: "remote",
		target: "memory",
		blocking: false
	})
);


/**
 * Events
 */
const listenners = [];
const changes = fn => {
	listenners.push(fn);

	return () => listenners.splice(listenners.indexOf(fn), 1);
};

let ready = false;

const onReady = () => new Promise(
	resolve => {
		const r = () => ready ? resolve(ready) : setTimeout(r, 1000);
		r();
	}
);

/**
 * Utils
 */
const genID = uuid;

/**
 * Setup
 */
async function setup() {
	let transform = await backup.pull(q => q.findRecords());
	await db.sync(transform);
	await coordinator.activate();
	ready = true;
}

setup();

export { db, genID, changes, onReady };

