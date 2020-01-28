const RECONNECT_DELAY = 5000; // Reconnect delay in case of errors such as network down.

export default function sync(
	context,
	url,
	options,
	baseRevision,
	syncedRevision,
	changes,
	partial,
	applyRemoteChanges,
	onChangesAccepted,
	onSuccess,
	onError
) {
	console.log("-- Send Changes --");

	/*
	console.log(
		JSON.stringify({
			type: "changes",
			changes: changes,
			partial: partial,
			baseRevision: baseRevision
		})
	);*/

	/*
	let i = 0;
	setInterval(() => {
		const taskID = Math.floor(Math.random() * 100);
		const description = "description_" + (++i);

		console.log("Add: " + description);

		applyRemoteChanges([
			{
				"type": 1,
				"table": "tasks",
				"key": taskID,
				"obj": {
					"taskID": taskID,
					"description": description,
					"tags": {
						"all": true
					},
					"done": 0,
					"deleted": 0,
					"createdAt": "2020-01-27T23:24:53.376Z",
					"updatedAt": "2020-01-27T23:24:53.376Z"
				}
			}
		], 1, false);
	}, 1000 * 10);*/

	/*
	onSuccess({
		react: function (changes, baseRevision, partial, onChangesAccepted) {
			// Send changes, baseRevisoin and partial to server
			// When server acks, call onChangesAccepted();
			// console.log(changes, baseRevision, partial, onChangesAccepted);
			onChangesAccepted();
		},
		disconnect: function () {
			// Disconnect from server!
			console.log("disconnect");
		}
	});*/
}
