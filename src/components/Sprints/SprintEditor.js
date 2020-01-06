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

import moment from "moment";

// import { ItemRenderer, MultiSelect } from "@blueprintjs/select";

// https://blueprintjs.com/docs/#select/multi-select

export default function SprintEditor ({addSprint}) {    

    const [date, setDate] = useState(new Date());
    const [tags, setTags] = useState([]);

    const datePicker = <DatePicker onChange={date => setDate(moment(date).endOf("day"))} />;

    return (
        <Callout intent={Intent.PRIMARY} title={moment(date).format("DD-MM-YYYY")} icon="insert">
            <div>
                <Divider />
                <SelectTags
                    label={"tags"}
                    onChange={tags => setTags(tags)}
                />
                <Popover content={datePicker} position={Position.BOTTOM}>
                    <Button icon="timeline-events" text={moment(date).format("DD-MM-YYYY")} />
                </Popover>
                <Button icon="add" onClick={() => addSprint({tags, date: moment(date).endOf("day").toDate()})} />
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
