import React, { useState } from "react";

import { useActiveTags } from "../db/tasks/hooks";

import {
    Checkbox,
    Popover,
    Position,
    Button
} from "@blueprintjs/core";

// https://blueprintjs.com/docs/#select/multi-select

export default function SelectTags ({onChange, label, filterTags={}}) {
    const tags = useActiveTags();
    
    filterTags["all"] = true;
    
    const checks = [];
    const orderTags = Object.keys(tags).sort();
    for (let i=0; i<orderTags.length; i++) {
        const tag = orderTags[i];

        checks.push(
            <Checkbox 
                label={tag} 
                checked={filterTags[tag]}
                disabled={tag === 'all'}
                key={tag}
                onChange={e => onChange && onChange({...filterTags, [tag]: e.target.checked})}
            />
        );
    }

    const tagsSelector = <div style={{padding: "0.5em"}}>{checks}</div>;

    return (
        <Popover content={tagsSelector} position={Position.BOTTOM}>
            <Button icon="tag" text={label || "filter"} />
        </Popover>
    );
}
