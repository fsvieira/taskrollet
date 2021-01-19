// import { Schema, NetworkError } from "@orbit/data";
import { Schema } from "@orbit/data";
import IndexedDBSource from "@orbit/indexeddb";
import MemorySource from "@orbit/memory";
import Coordinator, { SyncStrategy, RequestStrategy } from "@orbit/coordinator";
import JSONAPISource from "@orbit/jsonapi";

import IndexedDBBucket from "@orbit/indexeddb-bucket";

const bucket = new IndexedDBBucket({ namespace: "taskroulette-bucket" });

export const refreshTime = +process.env.REACT_JSONAPI_REFRESH_TIME_MINUTES * 1000 * 60;

// Sync all changes from memory source to remote
/*
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

let memDB;
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
export async function setup(user) {
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
	memDB = new MemorySource({
		bucket,
		schema
	});

	const backup = new IndexedDBSource({
		bucket,
		schema,
		name: "backup",
		namespace: "taskroulette"
	});

	const remote = new JSONAPISource({
		bucket,
		schema,
		name: "remote",
		host: process.env.REACT_JSONAPI_URL
	});

	remote.defaultFetchSettings.headers['Authorization'] = `Bearer ${user.token}`;
	// remote.defaultFetchHeaders.Authorization = "Bearer 1234";

	/**
	 * Tranform backup sync
	 */
	memDB.on("transform", transform => {
		backup.sync(transform);
		// listenners.forEach(fn => fn());
	});

	memDB.on("update", update => {
		console.log("ON UPDATE", update);
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

	coordinator.addStrategy(
		new RequestStrategy({
			source: "remote",
			on: "queryFail",
			action() {
				console.log("Query FAIL!!");
				this.source.requestQueue.skip();
			}
		})
	);

	coordinator.addStrategy(
		new RequestStrategy({
			source: "remote",
			on: "updateFail",
			action(transform, e) {
				console.log(transform, e);
				console.log("UPDATE FAIL!!");
				const remote = this.source;
				const store = this.coordinator.getSource("store");

				// Not working, NetworkError import seems to be an object ? 
				// if (e instanceof NetworkError) {
				if (e.constructor.name === 'NetworkError') {
					// When network errors are encountered, try again in 3s
					console.log("NetworkError - will try again soon");
					setTimeout(() => {
						remote.requestQueue.retry();
					}, 3000);
				} else {
					// When non-network errors occur, notify the user and
					// reset state.
					let label = transform.options && transform.options.label;
					if (label) {
						alert(`Unable to complete "${label}"`);
					} else {
						alert(`Unable to complete operation`);
					}

					// Roll back store to position before transform
					if (store.transformLog.contains(transform.id)) {
						console.log("Rolling back - transform:", transform.id);
						store.rollback(transform.id, -1);
					}

					return remote.requestQueue.skip();
				}
			},
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

	let transform = await backup.pull(q => q.findRecords());
	await memDB.sync(transform);
	await coordinator.activate();
	ready = true;
}

export async function clear() {
	IDBFactory.deleteDatabase("taskroulette");
	IDBFactory.deleteDatabase("taskroulette-bucket");
	localStorage.clear();
}
// setup();

