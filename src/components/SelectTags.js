import React from "react";

import { useActiveTags } from "../db/tasks";
import { useState } from 'react';

import {
    Checkbox,
    Popover,
    Position,
    Button
} from "@blueprintjs/core";

// https://blueprintjs.com/docs/#select/multi-select

export default function SelectTags ({onChange, label}) {    
    const tags = useActiveTags();
    const [selectedTags, setSelectedTags] = useState([]);

    const checks = tags.map(
        tag => {
            return (
                <Checkbox 
                    label={tag} 
                    checked={selectedTags.includes(tag)}
                    key={tag}
                    onChange={() => {
                        const index = selectedTags.indexOf(tag);
                        let s = selectedTags.slice();
                        
                        if (index !== -1) {
                            s.splice(index, 1);
                        }
                        else {
                            s.push(tag);
                        }

                        onChange && onChange(s);
                        setSelectedTags(s);
                    }}
                />
            );
        }
    );

    const tagsSelector = <div style={{padding: "0.5em"}}>{checks}</div>;

    return (
        <Popover content={tagsSelector} position={Position.BOTTOM}>
            <Button icon="tag" text={label || "filter"} />
        </Popover>
    );
}
