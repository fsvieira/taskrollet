import React from "react";

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

import SelectTags from "../SelectTags";
import { DatePicker } from "@blueprintjs/datetime";
import "@blueprintjs/datetime/lib/css/blueprint-datetime.css";

import TagsList from "../Tags/TagsList";

// import { ItemRenderer, MultiSelect } from "@blueprintjs/select";

// https://blueprintjs.com/docs/#select/multi-select

export default function SprintEditor ({addSprint}) {    

    const [date, setDate] = useState(new Date());
    const [tags, setTags] = useState([]);

    const datePicker = <DatePicker onChange={date => setDate(date)} />;

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
                <Button icon="add" onClick={() => addSprint({tags, date})} />
            </div>
            <div>
                <Divider />
                <TagsList tags={tags} />
            </div>
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
