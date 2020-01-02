import React from "react";

import { useActiveTags } from "../db/tasks/hooks";
import { useState } from 'react';

import {
    Checkbox,
    Popover,
    Position,
    Button
} from "@blueprintjs/core";

// https://blueprintjs.com/docs/#select/multi-select

export default function SelectTags ({onChange, label, filterTags={}}) {
    const tags = useActiveTags();
    // const [selectedTags, setSelectedTags] = useState(filterTags || {});

    const checks = [];
    for (let tag in tags) {
        checks.push(
            <Checkbox 
                label={tag} 
                checked={filterTags[tag]}
                disabled={tag === 'all'}
                key={tag}
                onChange={() => onChange && onChange(filterTags)}
                    /*
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
                }
                }*/
            />
        );
    }

    /*
    const checks = Object.keys(tags).map(
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
    );*/

    const tagsSelector = <div style={{padding: "0.5em"}}>{checks}</div>;

    return (
        <Popover content={tagsSelector} position={Position.BOTTOM}>
            <Button icon="tag" text={label || "filter"} />
        </Popover>
    );
}
