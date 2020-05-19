import { Schema } from "@orbit/data";
import IndexedDBSource from "@orbit/indexeddb";
import MemorySource from "@orbit/memory";
import Coordinator, { SyncStrategy, RequestStrategy } from "@orbit/coordinator";
import JSONAPISource from "@orbit/jsonapi";

export const refreshTime = +process.env.REACT_JSONAPI_REFRESH_TIME_MINUTES * 1000 * 60;

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
				tags: { type: "hasMany", model: "tag" }
			}
		},
		tag: {},
		sprint: {
			attributes: {
				createdAt: { type: "date-time" },
				dueDate: { type: "date-time" },
			},
			relationships: {
				tags: { type: "hasMany", model: "tag" }
			}
		},
		todo: {
			relationships: {
				task: { type: "hasOne", model: "task" }
			}
		}
	}
});

/**
 * Sources,
 */
// export const memDB = new MemorySource({ schema });
const memDB = new MemorySource({ schema });

const backup = new IndexedDBSource({
	schema,
	name: "backup",
	namespace: "taskroulette"
});

const remote = new JSONAPISource({
	schema,
	name: "remote",
	host: process.env.REACT_JSONAPI_URL // "http://localhost:9000/api/fsvieira"
});

/**
 * Tranform backup sync
 */
memDB.on("transform", transform => {
	backup.sync(transform);
	listenners.forEach(fn => fn());
});

/**
 * Coordinator
 */
const coordinator = new Coordinator({
	sources: [memDB, backup, remote]
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

// Sync all changes received from the remote server to the memory source
coordinator.addStrategy(
	new SyncStrategy({
		source: "remote",
		target: "memory",
		blocking: false
	})
);

/*
// Sync all changes from memory source to remote
coordinator.addStrategy(
	new SyncStrategy({
		source: "memory",
		target: "remote",
		blocking: false
	})
);*/

/**
 * Events
 */
const listenners = [];
export const changes = fn => {
	listenners.push(fn);

	return () => listenners.splice(listenners.indexOf(fn), 1);
};

let ready = false;

export const db = cache => new Promise(
	resolve => {
		const r = () => ready ? resolve(cache ? memDB.cache : memDB) : setTimeout(r, 1000);
		r();
	}
);

/**
 * Setup
 */
async function setup() {
	let transform = await backup.pull(q => q.findRecords());
	await memDB.sync(transform);
	await coordinator.activate();
	ready = true;
}

setup();

