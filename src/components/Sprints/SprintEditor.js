import React from "react";

import { useState } from 'react';

import {
    Popover,
    Position,
    Button,
    Callout,
    Intent,
    Divider
} from "@blueprintjs/core";

import SelectTags from "../SelectTags";
import { DatePicker } from "@blueprintjs/datetime";
import "@blueprintjs/datetime/lib/css/blueprint-datetime.css";

import TagsList from "../Tags/TagsList";

import moment from "moment";

// import { ItemRenderer, MultiSelect } from "@blueprintjs/select";

// https://blueprintjs.com/docs/#select/multi-select

export default function SprintEditor({ addSprint }) {

    const [date, setDate] = useState(moment().toDate());
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
                <Button icon="add" onClick={() => addSprint({ tags, dueDate: moment(date).endOf("day").toDate() })} />
            </div>
            <div>
                <Divider />
                <TagsList tags={tags} />
            </div>
        </Callout>
    );
}
