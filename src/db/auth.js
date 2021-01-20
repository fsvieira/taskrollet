import { useState, useEffect } from "react";
import { clear } from "./db";

import { useLocation, useHistory } from "react-router-dom";

export function useAuth() {
	const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
	const location = useLocation();
	const history = useHistory();

	useEffect(
		() => {
			if (user) {
				localStorage.setItem("user", JSON.stringify(user));
				// setup(user);
				history.replace(location.state || { pathname: "/" });
			}

			if (!user) {
				clear();
				history.replace({ pathname: "/login" });
			}
		},
		[user]
	);

	return [user, setUser];
}
