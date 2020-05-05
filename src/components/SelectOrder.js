import React, { useState } from "react";

import {
    RadioGroup,
    Radio,
    Popover,
    Position,
    Button
} from "@blueprintjs/core";

// https://blueprintjs.com/docs/#select/multi-select
import moment from "moment";

function createdAt(a, b) {
    return moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf();
}

function updatedAt(a, b) {
    return moment(b.updatedAt).valueOf() - moment(a.updatedAt).valueOf();
}

function doneUntil(a, b) {
    return moment(b.doneUntil).valueOf() - moment(a.doneUntil).valueOf();
}

function size(a, b) {
    return b.description.length - a.description.length;
}

function similiar(a, b) {
    alert("TODO: SIMILIAR");
}


export default function SelectOrder({ setOrderedTasks, tasks }) {
    const [orderBy, setOrderBy] = useState();

    const applyOrder = fn => {
        const sortedTasks = tasks.slice().sort(fn);
        setOrderedTasks(sortedTasks);
    };

    const onChange = e => {
        console.log("onChange", e.target.value);

        switch (e.target.value) {
            case "createdAt":
                applyOrder(createdAt);
                break;

            case "updatedAt":
                applyOrder(updatedAt);
                break;

            case "doneUntil":
                applyOrder(doneUntil);
                break;

            case "size":
                applyOrder(size);
                break;

            case "similiar":
                applyOrder(similiar);
                break;

        }

        setOrderBy(e.target.value);
    };

    const selector = <div style={{ padding: "0.5em" }}>
        <RadioGroup
            label="Order By"
            onChange={onChange}
            selectedValue={orderBy}
        >
            <Radio label="creation date" value="createdAt" />
            <Radio label="update date" value="updatedAt" />
            <Radio label="done until" value="doneUntil" />
            <Radio label="size" value="size" />
            <Radio label="similiar" value="similiar" />
        </RadioGroup>
    </div>;

    return (
        <Popover content={selector} position={Position.BOTTOM}>
            <Button icon="sort" />
        </Popover>
    );
}

