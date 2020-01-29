export default async function auth(username, password) {
	const data = { username, password };

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

	const token = r.token;

	localStorage.setItem("token", token);
	localStorage.setItem("username", username);

	return token;
}
