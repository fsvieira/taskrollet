import React from "react";
import {Tag} from "@blueprintjs/core";
import "@blueprintjs/datetime/lib/css/blueprint-datetime.css";


export default function TagsList ({tags}) {
    if (tags.length === 0) {
        return <p>All tags</p>;
    }

    const tagsList = Object.keys(tags).map(
        (tag,i) => <Tag 
            icon="tag" 
            large={true} 
            round={true} 
            style={{margin: "0.2em"}}
            key={i}
        >{tag.replace("#", "")}</Tag>
    );

    return (<>{tagsList}</>);
}
