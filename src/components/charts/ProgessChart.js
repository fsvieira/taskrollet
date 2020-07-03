/**
  Progress color pallete : https://www.color-hex.com/color-palette/32140
*/
import React from "react";

export default function ProgressChart({ total, closed }) {
    const max = 100;
    const unit = "%";

    return <div style={{
        padding: "0.5em"
    }}>
        <div
            style={{
                backgroundColor: "#ccc",
                border: "3px solid #666",
                width: `${max}${unit}`,
                height: "1.8em",
                borderRadius: "3px",
                position: "relative"
            }}
        >
            <div style={{
                width: `${max * (closed / total)}${unit}`,
                backgroundColor: "#c0ff33",
                height: "100%",
            }} />
            <div style={{
                position: "absolute",
                top: 0,
                left: "50%",
                color: "#555",
                zIndex: 10,
                fontWeight: "bold"
            }}>
                {Math.floor(100 * (closed / total))}%
        </div>
        </div>
    </div>;
}
