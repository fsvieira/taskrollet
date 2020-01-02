import React from "react";

import TaskEditor from "../components/TaskEditor";
import Todo from "../components/Todo";

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
                <Todo />
            </article>
            <footer style={{padding: "0.5em"}}>
                <TaskEditor />
            </footer>
        </>
    );
} 
