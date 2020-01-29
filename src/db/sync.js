/*
import faye from "faye";

let token;

async function getToken() {
	if (token) {
		return token;
	}

	const data = { username: "fsvieira", password: "" };

	const response = await fetch(`${process.env.REACT_APP_API_URL}/api/login`, {
		method: "POST", // *GET, POST, PUT, DELETE, etc.
		mode: "cors", // no-cors, *cors, same-origin
		cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
		credentials: "same-origin", // include, *same-origin, omit
		headers: {
			"Content-Type": "application/json"
		},
		redirect: "follow", // manual, *follow, error
		referrerPolicy: "no-referrer", // no-referrer, *client
		body: JSON.stringify(data) // body data type must match "Content-Type" header
	});

	const r = await response.json();

	return token = r.token;
}

export const client = new faye.Client(`${process.env.REACT_APP_API_URL}/bayeux`);

export const publish = data => {
	client.publish("/fsvieira/projects", data);
};

async function setup() {
	const clientAuth = {
		outgoing: async function (message, callback) {
			// Again, leave non-subscribe messages alone
			if (message.channel !== "/meta/subscribe") {
				return callback(message);
			}

			const token = await getToken();

			// Add ext field if it's not present
			if (!message.ext) message.ext = {};

			// Set the auth token
			message.ext.authToken = token;

			// Carry on and send the message to the server
			console.log("send " + JSON.stringify(message));

			callback(message);
		}
	};

	client.addExtension(clientAuth);

	const subscription = client.subscribe("/fsvieira/projects", message => {
		console.log("==>" + JSON.stringify(message));
	});

	publish({ action: "sync", date: new Date() });
}

setup();
*/

import faye from "faye";

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

	let token;
	console.log(url);
	const client = new faye.Client(url);

	const clientAuth = {
		outgoing: async function (message, callback) {
			// Again, leave non-subscribe messages alone
			if (message.channel !== "/meta/subscribe") {
				return callback(message);
			}

			token = token || localStorage.getItem("token");

			if (token) {
				// Add ext field if it's not present
				if (!message.ext) message.ext = {};

				// Set the auth token
				message.ext.authToken = token;
			}
			else {
				message.error = "Invalid Token";
			}

			callback(message);

		}
	};

	client.addExtension(clientAuth);

	console.log(
		JSON.stringify({
			type: "changes",
			changes: changes,
			partial: partial,
			baseRevision: baseRevision
		})
	);

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

	onSuccess({
		react: function (changes, baseRevision, partial, onChangesAccepted) {
			// Send changes, baseRevisoin and partial to server
			// When server acks, call onChangesAccepted();
			console.log(changes, baseRevision, partial, onChangesAccepted);
			onChangesAccepted();
		},
		disconnect: function () {
			// Disconnect from server!
			console.log("disconnect");
		}
	});

	// setTimeout(() => onError("Socket closed: ", 30), 1000 * 10);
}
