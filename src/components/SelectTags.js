import React, { useState } from "react";

import { useActiveTags } from "../db/tasks/hooks";

import {
    Checkbox,
    Popover,
    Position,
    Button
} from "@blueprintjs/core";

// https://blueprintjs.com/docs/#select/multi-select

export default function SelectTags({ onChange, label, noText, filterTags = { all: true }, filterDoneUntil }) {
    const { tags, selectedTags, setSelectedTags } = useActiveTags(filterDoneUntil, filterTags);

    // const [selectedTags, setSelectedTags] = useState(filterTags);

    const checks = [];
    const orderTags = Object.keys(tags).sort();
    for (let i = 0; i < orderTags.length; i++) {
        const tag = orderTags[i];

        checks.push(
            <Checkbox
                label={tag}
                defaultChecked={selectedTags[tag]}
                disabled={tag === 'all'}
                key={tag}
                onChange={
                    e => {
                        const tags = { ...selectedTags, [tag]: e.target.checked };

                        if (!e.target.checked) {
                            delete tags[tag];
                        }

                        setSelectedTags(tags);
                        onChange && onChange(tags);
                    }
                }
            />
        );
    }

    const tagsSelector = <div style={{ padding: "0.5em", overflow: "auto", maxHeight: "70vh", width: "15em" }}>{checks}</div>;

    return (
        <Popover content={tagsSelector} position={Position.BOTTOM}>
            <Button icon="tag" text={noText ? "" : label || "filter"} />
        </Popover>
    );
}

