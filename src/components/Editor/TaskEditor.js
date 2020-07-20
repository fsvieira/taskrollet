import React, { useState } from "react";
import { useTranslation } from 'react-i18next';

import {
  Button,
  Position,
  Divider,
  Card,
  Elevation,
  Switch
} from "@blueprintjs/core";

import "@blueprintjs/core/lib/css/blueprint.css";
import { useActiveTags } from "../../db/tasks/hooks";
import { addTaskText, splitTask, parseValue } from "./editor";

import TextInput from 'react-autocomplete-input';
import 'react-autocomplete-input/dist/bundle.css';

export default function TaskEditor({
  task,
  onSave,
  canSplitTask = false,
  width = "100%",
  height = "8em"
}) {

  const [valueA, setValueA] = useState(task ? task.description : "");
  const [valueB, setValueB] = useState(task ? task.description : "");

  const { t } = useTranslation();

  const { tags } = useActiveTags();

  const newTags = parseValue(valueA, tags).concat(parseValue(valueB, tags));

  const [split, setSplit] = useState(false);

  const submitText = t(task ? (split ? "SPLIT" : "SAVE") : "ADD");

  const submit = () => {
    if (split) {
      splitTask(t, task, valueA, valueB, onSave);
    }
    else if (addTaskText(t, task, valueA, onSave)) {
      setValueA("");
    }
  };

  return (
    <>
      {canSplitTask && <Switch checked={split} label={t("SPLIT")} onChange={e => setSplit(e.target.checked)} />}
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
          style={{ width: "100%", height: split ? "45%" : height }}
          value={valueA}
          onChange={setValueA}
          placeholder={t("PLACEHOLDER_WRITE_TASK")}
        />
        {canSplitTask && split &&
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
        }
        <Divider />
        <Button
          position={Position.RIGHT}
          onClick={submit}
          disabled={valueA.trim() === '' || (split && valueB.trim() === '')}
        >{submitText}</Button>
      </Card>
    </>
  );

}
