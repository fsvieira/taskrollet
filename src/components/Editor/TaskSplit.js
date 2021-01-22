import React, { useState } from "react";

import { useTranslation } from 'react-i18next';

import {
  Button,
  Position,
  Divider,
  Card,
  Elevation
} from "@blueprintjs/core";

import "@blueprintjs/core/lib/css/blueprint.css";
import { useActiveTags } from "../../db/tasks/hooks";
import { splitTask, parseValue } from "./editor";

import TextInput from 'react-autocomplete-input';
import 'react-autocomplete-input/dist/bundle.css';

export default function TaskSplit({
  task,
  onSave
}) {
  const { t } = useTranslation();

  const [valueA, setValueA] = useState(task ? task.description : "");
  const [valueB, setValueB] = useState(task ? task.description : "");

  const { tags } = useActiveTags();

  const newTags = parseValue(valueA, tags).concat(parseValue(valueB, tags));

  return (
    <Card
      interactive={true}
      elevation={Elevation.TWO}
      style={{ height: "100%" }}
    >
      <TextInput
        options={newTags}
        trigger="#"
        offsetY={-50}
        offsetX={15}
        style={{ width: "100%", height: "45%" }}
        value={valueA}
        onChange={setValueA}
        placeholder={t("PLACEHOLDER_WRITE_TASK")}
      />
      <TextInput
        options={newTags}
        trigger="#"
        offsetY={-50}
        offsetX={15}
        style={{ width: "100%", height: "45%" }}
        value={valueB}
        onChange={setValueB}
        placeholder={t("PLACEHOLDER_WRITE_TASK")}
      />
      <Divider />
      <Button
        position={Position.RIGHT}
        onClick={() => splitTask(t, task, valueA, valueB, onSave)}
        disabled={valueA.trim() === '' || valueB.trim() === ''}
      >Split</Button>
    </Card>
  );

}
