import React, { useState } from "react";

import {
  Button,
  Position,
  Divider,
  Card,
  Elevation
} from "@blueprintjs/core";

import "@blueprintjs/core/lib/css/blueprint.css";
import { useActiveTags } from "../../db/tasks/hooks";
import { addTaskText, parseValue } from "./editor";

import TextInput from 'react-autocomplete-input';
import 'react-autocomplete-input/dist/bundle.css';

export default function TaskEditor({ task, onSave }) {

  const [value, setValue] = useState(task ? task.description : "");
  const { tags } = useActiveTags();

  const newTags = parseValue(value, tags);

  return (
    <Card
      interactive={true}
      elevation={Elevation.TWO}
    >
      <TextInput
        options={newTags}
        trigger="#"
        offsetY={-50}
        offsetX={15}
        style={{ width: "100%", height: "8em" }}
        value={value}
        onChange={setValue}
        placeholder={" Write here the task description, use # to add #tags!!"}
      />
      <Divider />
      <Button
        position={Position.RIGHT}
        onClick={() => {
          if (addTaskText(task, value, onSave)) {
            setValue("");
          }
        }}
      >{task ? "Save" : "Add"}</Button>
    </Card>
  );

}
