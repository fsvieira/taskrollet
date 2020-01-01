import React from "react";

import {
  Classes,
  Position,
  Callout,
  Intent,
  Divider,
  Button,
  Popover,
  H5
} from "@blueprintjs/core";

import TagsList from "../Tags/TagsList";
import SprintStats from "./SprintStats";

export default function Sprint ({sprint, deleteSprint}) {
  const date = new Date(sprint.date).toISOString().substring(0, 10);

      const confirmDelete = (
        <div style={{padding: "0.5em"}}>
          <H5>Confirm deletion</H5>
          <p>Are you sure you want to delete these items? You won't be able to recover them.</p>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 15 }}>
            <Button className={Classes.POPOVER_DISMISS} style={{ marginRight: 10 }}>
              Cancel
            </Button>
            <Button 
              intent={Intent.DANGER} 
              className={Classes.POPOVER_DISMISS}
              onClick={() => deleteSprint(sprint)}
            >
              Delete
            </Button>
          </div>
        </div>
      );
  
      const title = (
        <p>
          {date}
          <span style={{float: "right"}}>
            <Popover 
              content={confirmDelete} 
              position={Position.BOTTOM}
              style={{float: "right"}}
            >
              <Button 
                icon="trash" 
                intent={Intent.DANGER} 
                style={{float: "right"}}
              />
            </Popover>
          </span>
        </p>
      );
  
      const endDateTime = new Date(sprint.date).getTime();
      let intent = Intent.SUCCESS;
      if (endDateTime < sprint.expectedDueDate) {
        intent = Intent.DANGER;
      }
      else {
        // get 15% of remaining time.
        const time = (new Date().getTime() - endDateTime) * 0.15;
  
        if (sprint.expectedDueDate > endDateTime - time) {
          intent = Intent.WARNING;
        } 
      }
    
      return (
        <Callout 
          intent={intent} 
          title={title} 
          icon="walk"
          style={{marginBottom: "0.5em"}}
        >
          <Divider />
          <TagsList tags={sprint.tags} />
          <SprintStats sprint={sprint} />
        </Callout>
      );
  
  }

/*
export default function Sprint ({sprint, deleteSprint}) {
  const sprintsList = sprints.map((sprint, i) => {
    const date = new Date(sprint.date).toISOString().substring(0, 10);

    const confirmDelete = (
      <div style={{padding: "0.5em"}}>
        <H5>Confirm deletion</H5>
        <p>Are you sure you want to delete these items? You won't be able to recover them.</p>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 15 }}>
          <Button className={Classes.POPOVER_DISMISS} style={{ marginRight: 10 }}>
            Cancel
          </Button>
          <Button 
            intent={Intent.DANGER} 
            className={Classes.POPOVER_DISMISS}
            onClick={() => deleteSprint(sprint)}
          >
            Delete
          </Button>
        </div>
      </div>
    );

    const title = (
      <p>
        {date}
        <span style={{float: "right"}}>
          <Popover 
            content={confirmDelete} 
            position={Position.BOTTOM}
            style={{float: "right"}}
          >
            <Button 
              icon="trash" 
              intent={Intent.DANGER} 
              style={{float: "right"}}
            />
          </Popover>
        </span>
      </p>
    );

    const endDateTime = new Date(sprint.date).getTime();
    let intent = Intent.SUCCESS;
    if (endDateTime < sprint.expectedDueDate) {
      intent = Intent.DANGER;
    }
    else {
      // get 15% of remaining time.
      const time = (new Date().getTime() - endDateTime) * 0.15;

      if (sprint.expectedDueDate > endDateTime - time) {
        intent = Intent.WARNING;
      } 
    }
  
    return (
      <Callout 
        key={i} 
        intent={intent} 
        title={title} 
        icon="walk"
        style={{marginBottom: "0.5em"}}
      >
        <Divider />
        <TagsList tags={sprint.tags} />
        <SprintStats sprint={sprint} />
      </Callout>
    );
  });

  return <div>{sprintsList}</div>;
}
*/