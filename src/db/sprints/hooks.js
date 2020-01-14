import { addSprint, deleteSprint } from "./db";
import { $activeSprintsTasks } from "./streams";
import { useState, useEffect } from "react";

export const useActiveSprints = () => {
	const [sprints, setSprints] = useState({});

	useEffect(
		() => {
			const cancel = $activeSprintsTasks().onValue(setSprints);

			return () => cancel();
		},
		[true]
	);

	return {
		sprints,
		addSprint,
		deleteSprint
	};
};

