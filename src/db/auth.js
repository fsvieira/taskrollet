import { useState, useEffect } from "react";
import { setup, clear } from "./db";

import { useLocation, useHistory } from "react-router-dom";

/*
const history = useHistory();
const location = useLocation();
const { from } = location.state || { from: { pathname: "/" } };
*/

export function useAuth() {
	const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user")));
	const location = useLocation();
	const history = useHistory();

	useEffect(
		() => {
			if (user) {
				(user.forever ? localStorage : sessionStorage).setItem("user", JSON.stringify(user));
				console.log("Start Database!!");
				history.replace(location.state || { pathname: "/" });
			}

			if (!user) {
				console.log("Remove database!");
				history.replace({ pathname: "/login" });
			}
		},
		[user]
	);

	return [user, setUser];
}
