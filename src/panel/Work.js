import React from "react";

import TaskEditor from "../components/TaskEditor";
import TODO from "../components/TODO";

export default function Work () {
    return (
        <>
            <article
                style={{
                    flex: "1 1 auto",
                    overflow: "none",
                    height: "100px",
                    padding: "0.5em",
                    float: "right"
                }}
            >
                <TODO />
            </article>
            <footer style={{padding: "0.5em"}}>
                <TaskEditor />
            </footer>
        </>
    );
} 
