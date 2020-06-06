import React, { useState, Suspense } from "react";

import {
  Alignment,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  Icon,
  Intent
} from "@blueprintjs/core";

import "@blueprintjs/core/lib/css/blueprint.css";

import Sprints from "./components/Sprints/Sprints";

import Work from "./panel/Work";
import Tasks from "./panel/Tasks";

const Drawers = {
  CLOSED: 0,
  SPRINTS: 1
};

const Content = {
  WORK: 1,
  TASKS: 2
};

export default function App() {
  const [drawer, setDrawer] = useState(Drawers.CLOSED);
  const [content, setContent] = useState(Content.WORK);

  const openDrawer = drawer => setDrawer(drawer);
  const onDrawerClose = () => setDrawer(Drawers.CLOSED);
  const openContent = content => setContent(content);

  return (
    <Suspense fallback="loading">
      <section
        className="App"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%"
        }}
      >
        <Sprints
          isOpen={drawer === Drawers.SPRINTS}
          onClose={onDrawerClose}
        />
        <header>
          <Navbar style={{ flexGrow: 1 }}>
            <NavbarGroup align={Alignment.LEFT}>
              <NavbarHeading>
                <Icon
                  icon='walk'
                  iconSize={Icon.SIZE_LARGE}
                  intent={Intent.NONE}
                  onClick={() => openDrawer(Drawers.SPRINTS)}
                />
              </NavbarHeading>

              {
                <NavbarHeading>
                  <Icon
                    icon='build'
                    iconSize={Icon.SIZE_LARGE}
                    intent={content === Content.WORK ? Intent.PRIMARY : Intent.NONE}
                    onClick={() => openContent(Content.WORK)}
                  />
                </NavbarHeading>
              }

              {
                <NavbarHeading>
                  <Icon
                    icon='projects'
                    iconSize={Icon.SIZE_LARGE}
                    intent={content === Content.TASKS ? Intent.PRIMARY : Intent.NONE}
                    onClick={() => openContent(Content.TASKS)}
                  />
                </NavbarHeading>
              }
            </NavbarGroup>
          </Navbar>
        </header>
        {content === Content.WORK && <Work />}
        {content === Content.TASKS && <Tasks />}
      </section>
    </Suspense>
  );
}
