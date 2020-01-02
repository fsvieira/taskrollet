import React, { useState } from "react";

import {
  Button,
  Position,
  Divider,
  Card,
  Elevation,
  Intent
} from "@blueprintjs/core";

import "@blueprintjs/core/lib/css/blueprint.css";
import { AppToaster } from './Notification';
import { addTask } from '../db/tasks/db';
import { useActiveTags } from "../db/tasks/hooks";

import TextInput from 'react-autocomplete-input';
import 'react-autocomplete-input/dist/bundle.css';


export default function TaskEditor () {

  const [value, setValue] = useState()
  const tags = useActiveTags();

  async function addTaskText (text) {
    const tags = (text.match(/#([^\s]+)/g) || []).concat(["all"]).map(t => t.replace("#", ""));
    const task = {
      description: text,
      tags: tags.reduce((acc, tag) => {
        acc[tag] = true;
        return acc;
      }, {}),
      createdAt: new Date()
    };

    const msg = task.description.length > 10?task.description.substring(0, 10) + "...":task.description;

    try {
      await addTask(task);
      setValue("");

      AppToaster.show({
        message: `Task Added: ${msg}`,
        intent: Intent.SUCCESS
      });
    }
    catch (e) {
      AppToaster.show({
        message: `Fail to add Task: ${msg}`,
        intent: Intent.DANGER
      });
    }
  }

  function parseValue (value) {
    const pTags = Object.keys(tags).map(t => t.replace("#", ""));
  
    if (value) {
      const eTags = value.match(/\#([^\s]+)\s/g);
  
      if (eTags) {
        const newTags = [...new Set(pTags.concat(eTags.map(t => t.replace("#", "").replace(/[\s]/, ""))))];
        newTags.sort();
        return newTags;
      }
    }

    return pTags;
  }

  const newTags = parseValue(value);

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
          style={{width: "100%", height: "8em"}}
          value={value}
          onChange={setValue}
          placeholder={" Write here the task description, use # to add #tags!!"}
        />
        <Divider />
        <Button 
          position={Position.RIGHT} 
          onClick={() => addTaskText(value)}
        >Add</Button>    
    </Card>
  );

}
