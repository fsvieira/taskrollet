import React from "react";

import { useTranslation } from 'react-i18next';

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

  const { t } = useTranslation();

  const renderSprints = (sprints || []).filter(s => !s.empty).sort((a, b) => {
    const aEndDateTime = moment(a.dueDate).valueOf();
    const at = (aEndDateTime - a.estimatedDueDate);

    const bEndDateTime = moment(b.dueDate).valueOf();
    const bt = (bEndDateTime - b.estimatedDueDate);

    return at - bt;
  });

  const sprintsList = renderSprints.map((sprint, i) => <Sprint key={i} sprint={sprint} deleteSprint={deleteSprint} />);

  return (
    <Drawer
      icon="walk"
      onClose={onClose}
      title={t("SPRINTS")}
      isOpen={isOpen}
      position={Position.LEFT}
    >
      <div className={Classes.DRAWER_BODY}>
        <div className={Classes.DIALOG_BODY}>
          {sprintsList}
          <SprintEditor addSprint={addSprint} />
        </div>
      </div>
    </Drawer >
  );
}
