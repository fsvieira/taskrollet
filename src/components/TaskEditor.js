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
import { addTask } from '../db/tasks';
import { useActiveTags } from "../db/tasks";

import TextInput from 'react-autocomplete-input';
import 'react-autocomplete-input/dist/bundle.css';


export default function TaskEditor () {

  const [value, setValue] = useState()
  const tags = useActiveTags();

  async function addTaskText (text) {
    const tags = text.match(/#([^\s]+)/g);
    const task = {
      description: text,
      tags: [...new Set(tags)],
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
    const pTags = tags.map(t => t.replace("#", ""));
  
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

/*
class TaskEditor extends Component {
  constructor () {
    super();

    this.state = {
      value: ''
    };
  }

  // TODO: check how to solve parcel compile async/await, 
  // rigth now its working only for latest browsers with this package json config: 
  //   "browserslist": [
  //  "last 1 Chrome versions"
  // ],

  async addTask (text) {
    const tags = text.match(/#([^\s]+)/g);
    const task = {
      description: text,
      tags: [...new Set(tags)],
      createdAt: new Date()
    };

    const msg = task.description.length > 10?task.description.substring(0, 10) + "...":task.description;

    try {
      await addTask(task);
      this.setState({value: ''});

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

  render () {
    return (
        <Card 
          interactive={true} 
          elevation={Elevation.TWO}
        >
            <EditableText 
              multiline={true} 
              minLines={12} 
              maxLines={12}
              value={this.state.value}
              onChange={value => this.setState({value})}
            />
            <Divider />
            <Button 
              position={Position.RIGHT} 
              onClick={() => this.addTask(this.state.value)}
            >Add</Button>    
        </Card>
    );
  }
}

export default TaskEditor;*/
