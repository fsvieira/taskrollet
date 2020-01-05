import React from "react";

import {
  Classes,
  Drawer,
  Position,
  Callout,
  Intent,
  Divider,
  Button,
  Popover,
  H5
} from "@blueprintjs/core";

import "@blueprintjs/core/lib/css/blueprint.css";

import SprintEditor from "./SprintEditor";
import Sprint from "./Sprint";

import {useActiveSprints} from "../../db/sprints/hooks";

export default function Sprints ({onClose, isOpen}) {
  const {
    sprints,
    addSprint,
    deleteSprint
  } = useActiveSprints();

  const sprintsList = sprints.map((sprint, i) => <Sprint key={i} sprint={sprint} deleteSprint={deleteSprint} />);

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
          <SprintEditor addSprint={addSprint}/>
        </div>
      </div>
    </Drawer>
  );
}
