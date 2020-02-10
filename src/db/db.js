import { Schema } from "@orbit/data";
import IndexedDBSource from "@orbit/indexeddb";
import MemorySource from "@orbit/memory";
import Coordinator, { SyncStrategy } from "@orbit/coordinator";
import { uuid } from "@orbit/utils";
/*
	tasks: "&taskID,createdAt,updatedAt,description,tags,deleted,done,[deleted+done],_clientRev,_serverRev,_updatedAt",
	sprints: "&sprintID,createdAt,dueDate,tags",
	todo: "&todoID,taskID,tags"

*/

const schema = new Schema({
	models: {
		task: {
			attributes: {
				description: { type: "string" },
				/*done: { type: "boolean" },
				deleted: { type: "boolean" },
				createdAt: { type: "date-time" },
				updatedAt: { type: "date-time" }*/
			},
			relationships: {
				tags: { type: "hasMany", model: "tag", inverse: "task" }
			}
		},
		tag: {
			attributes: {
				name: { type: "string" }
			},
			relationships: {
				task: { type: "hasOne", model: "task", inverse: "tags" }
			}
		}/*,
		sprint: {
			attributes: {
				createdAt: { type: "date-time" },
				dueDate: { type: "date-time" },
			},
			relationships: {
				tags: { type: "hasMany", model: "tag", inverse: "sprint" }
			}
		},
		todo: {
			relationships: {
				tags: { type: "hasMany", model: "tag", inverse: "todo" },
				taskID: { type: "hasOne", model: "task" }
			}
		}*/
	}
});

/*
const schema = new Schema({
	models: {
		planet: {
			attributes: {
				name: { type: "string" },
				classification: { type: "string" }
			},
			relationships: {
				moons: { type: "hasMany", model: "moon", inverse: "planet" }
			}
		},
		moon: {
			attributes: {
				name: { type: "string" }
			},
			relationships: {
				planet: { type: "hasOne", model: "planet", inverse: "moons" }
			}
		}
	}
});
*/

const db = new MemorySource({ schema });

/*
const backup = new IndexedDBSource({
	schema,
	name: "backup",
	namespace: "taskroulette"
});


console.log(typeof db);*/

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

	console.log(JSON.stringify(transform));
	listenners.forEach(fn => fn());
});

const coordinator = new Coordinator({
	sources: [db, backup]
});

const backupMemorySync = new SyncStrategy({
	source: "memory",
	target: "backup",
	blocking: true
});

coordinator.addStrategy(backupMemorySync);

// `activate` resolves when all strategies have been activated

async function setup() {
	let transform = await backup.pull(q => q.findRecords());
	await db.sync(transform);
	await coordinator.activate();
}

setup();

const genID = uuid;

export { db, genID, changes };

async function test() {
	let transform = await backup.pull(q => q.findRecords());
	await db.sync(transform);
	await coordinator.activate();

	/*
	await db.update(t => [
		t.addRecord({
			taskID: uuid(),
			description: "TESTE TASK!!",
			tags: ["test", "tags"],
			done: false,
			deleted: false,
			createdAt: new Date(),
			updatedAt: new Date()
		})
	]);

	let tasks = await db.query(q => q.findRecords("planet").sort("taskID"));
	console.log(tasks);*/

	const tag1 = {
		type: "tag",
		id: "tag1",
		attributes: {
			name: "TAG1"
		},
		relationships: {
			task: { data: { type: "task", id: "task-1" } }
		}
	};

	const tag2 = {
		type: "tag",
		id: "tag2",
		attributes: {
			name: "TAG1"
		},
		relationships: {
			task: { data: { type: "task", id: "task-1" } }
		}
	};

	/*
	type: "task"
	attributes: {
		description: "11"
	}

	*/

	const task = {
		type: "task",
		id: "task-1",
		attributes: {
			description: "Task example!!"
		},
		relationships: {
			tags: {
				data: [
					{ type: "tag", id: "tag1" },
					{ type: "tag", id: "tag2" }
				]
			}
		}
	};
	/*
		const venus = {
			type: "planet",
			id: "venus",
			attributes: {
				name: "Venus",
				classification: "terrestrial",
				atmosphere: true
			}
		};
	
		const theMoon = {
			type: "moon",
			id: "theMoon",
			attributes: {
				name: "The Moon"
			},
			relationships: {
				planet: { data: { type: "planet", id: "earth" } }
			}
		};*/

	try {

		await db.update(t => [
			t.addRecord(task),
			t.addRecord(tag1),
			t.addRecord(tag2)
		]);
	}
	catch (e) {
		console.log(e);
	}
	// let planets = await db.query(q => q.findRelatedRecord({ type: "tag", id: "tag1" }, "task"));
	let planets = await db.query(q => q.findRelatedRecords({ type: "task", id: "task-1" }, "tags"));
	console.log(planets);
}

console.log("TESTE");
// test();
