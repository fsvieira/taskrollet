import React, { useState, useEffect, useContext, createContext } from "react";
import { clear, startSync } from "./db";

const authContext = createContext();

function useProvideAuth() {
	const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user")));
	const [error, setError] = useState();

	useEffect(
		() => {
			if (user) {
				(user.forever ? localStorage : sessionStorage).setItem("user", JSON.stringify(user));

				startSync(user.token).catch(e => setError(e));

			} else {
				console.log("clear");
				clear();
			}
		},
		[user]
	);

	return [user, setUser, error];
}

export function ProvideAuth({ children }) {
	const auth = useProvideAuth();
	return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

export const useAuth = () => useContext(authContext);