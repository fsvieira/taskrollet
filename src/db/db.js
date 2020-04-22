import { Schema } from "@orbit/data";
import IndexedDBSource from "@orbit/indexeddb";
import MemorySource from "@orbit/memory";
import Coordinator, { SyncStrategy } from "@orbit/coordinator";
import { uuid } from "@orbit/utils";

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

const db = new MemorySource({ schema });

const backup = new IndexedDBSource({
	schema,
	name: "backup",
	namespace: "taskroulette"
});

const listenners = [];
const changes = fn => {
	listenners.push(fn);

	return () => listenners.splice(listenners.indexOf(fn), 1);
};

db.on("transform", transform => {
	backup.sync(transform);

	console.log("TRASNFORM -> " + JSON.stringify(transform));
	listenners.forEach(fn => fn());
});

const coordinator = new Coordinator({
	sources: [db, backup]
});

const backupMemorySync = new SyncStrategy({
	source: "memory",
	target: "backup",
	blocking: false
});

coordinator.addStrategy(backupMemorySync);

async function setup() {
	let transform = await backup.pull(q => q.findRecords());
	await db.sync(transform);
	await coordinator.activate();
}

setup();

const genID = uuid;

export { db, genID, changes };

