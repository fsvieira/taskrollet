import React from "react";

import {
  Classes,
  Drawer,
  Position
} from "@blueprintjs/core";

import "@blueprintjs/core/lib/css/blueprint.css";

import SprintEditor from "./SprintEditor";
import Sprint from "./Sprint";

import { useActiveSprints } from "../../db/sprints/hooks";

import moment from "moment";

export default function Sprints({ onClose, isOpen }) {
  const {
    sprints: { sprints },
    addSprint,
    deleteSprint
  } = useActiveSprints();

  const renderSprints = (sprints || []).filter(s => !s.attributes.empty).sort((a, b) => {
    const aEndDateTime = moment(a.attributes.dueDate).valueOf();
    const at = (aEndDateTime - a.attributes.estimatedDueDate);

    const bEndDateTime = moment(b.attributes.dueDate).valueOf();
    const bt = (bEndDateTime - b.attributes.estimatedDueDate);

    return at - bt;
  });

  const sprintsList = renderSprints.map((sprint, i) => <Sprint key={i} sprint={sprint} deleteSprint={deleteSprint} />);

  return (
    <Drawer
      icon="walk"
      onClose={onClose}
      title="Sprints"
      isOpen={isOpen}
      position={Position.LEFT}
    >
      <div className={Classes.DRAWER_BODY}>
        <div className={Classes.DIALOG_BODY}>
          {sprintsList}
          <SprintEditor addSprint={addSprint} />
        </div>
      </div>
    </Drawer>
  );
}
