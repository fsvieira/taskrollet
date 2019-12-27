import React, { Component} from "react";

import {
  Button,
  Position,
  EditableText,
  Divider,
  Card,
  Elevation,
  Intent
} from "@blueprintjs/core";

import "@blueprintjs/core/lib/css/blueprint.css";
import { AppToaster } from './Notification';
import { addTask } from '../db/tasks';

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

export default TaskEditor;
