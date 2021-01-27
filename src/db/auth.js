import { useState, useEffect, useRef } from "react";
import { clear, startSync } from "./db";

import { useLocation, useHistory } from "react-router-dom";

const API_URL_RENEW = process.env.REACT_JSONAPI_URL + "/renew";

export function useAuth() {
	const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user")));
	const [error, setError] = useState();
	const location = useLocation();
	const history = useHistory();

	const token = useRef(null);

	useEffect(
		() => {
			if (user) {
				token.current = user.token;

				(user.forever ? localStorage : sessionStorage).setItem("user", JSON.stringify(user));
				// setup(user);
				history.replace(location.state || { pathname: "/" });

				if (!user.forever) {
					const id = setTimeout(async () => {
						if (user) {
							try {
								const data = await fetch(API_URL_RENEW, {
									method: 'GET',
									headers: {
										'Content-Type': "application/json",
										'Authorization': `Bearer ${user.token}`
									}
								});

								if (data.status === 401) {
									// fail to get token logout.
									setUser(null);
								}
								else if (data.status === 200) {
									const { token } = await data.json();

									setUser({
										...user,
										token
									});
								}

							} catch (e) { }
						}
					}, 1000 * 60 * 6)

					return () => clearTimeout(id);
				}
			} else {
				clear();
				history.replace({ pathname: "/login" });
			}
		},
		[user]
	);

	useEffect(
		() => {
			startSync(token).catch(e => {
				setError(e);
			});
		}, []
	);

	return [user, setUser, error];
}
