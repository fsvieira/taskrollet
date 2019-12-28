import React from "react";

import { useActiveTags } from "../db/tasks";
import { useState } from 'react';

import {
    Popover,
    Position,
    Button,
    Callout,
    Intent,
    Tag,
    Divider
} from "@blueprintjs/core";

import SelectTags from "./SelectTags";
import { DatePicker } from "@blueprintjs/datetime";
import "@blueprintjs/datetime/lib/css/blueprint-datetime.css";


// import { ItemRenderer, MultiSelect } from "@blueprintjs/select";

// https://blueprintjs.com/docs/#select/multi-select

export default function SprintEditor () {    

    const [date, setDate] = useState(new Date());
    const [tags, setTags] = useState([]);

    function addSprint () {
        alert(JSON.stringify(tags) + " || " + date);
    }

    const datePicker = <DatePicker onChange={date => setDate(date)}/>;
    const tagsList = tags.map(
        (tag,i) => <Tag 
            icon="tag" 
            large={true} 
            round={true} 
            style={{margin: "0.2em"}}
            key={i}
        >{tag.replace("#", "")}</Tag>
    );

    return (
        <Callout intent={Intent.PRIMARY} title={date.toISOString().substring(0, 10)} icon="insert">
            <div>
                <Divider />
                <SelectTags
                    label={"tags"}
                    onChange={tags => setTags(tags)}
                />
                <Popover content={datePicker} position={Position.BOTTOM}>
                    <Button icon="timeline-events" text={date.toISOString().substring(0, 10)} />
                </Popover>
                <Button icon="add" onClick={addSprint} />
            </div>
            {(tagsList.length > 0) && 
                <div>
                    <Divider />
                    {tagsList}
                </div>
            }
        </Callout>
    );

    /*
    return <MultiSelect 
        tagInputProps={{ placeholder: 'Search tags' }}
        itemRenderer={value => <div>{value}</div>}
        tagRenderer={value => value}
        items={tags}
        selectedItems={[]}
        onItemSelect={(e) => console.log(e)}
    />*/


}
