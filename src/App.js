import React, { useState, Suspense } from "react";

import { useAuth, ProvideAuth } from "./db/auth";

import {
  Alignment,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  Icon,
  Intent,
  Tooltip,
  Position
} from "@blueprintjs/core";

import { useTranslation } from 'react-i18next';

import "@blueprintjs/core/lib/css/blueprint.css";

import Sprints from "./components/Sprints/Sprints";

import Work from "./panel/Work";
import Tasks from "./panel/Tasks";
import Login from "./panel/Login";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";

const Drawers = {
  CLOSED: 0,
  SPRINTS: 1
};

const Content = {
  WORK: 1,
  TASKS: 2
};

export default function App() {
  return <ProvideAuth>
    <Router>
      <Switch>
        <Route path="/login">
          <Login />
        </Route>

        <PrivateRoute path="/">
          <Taskroulette />
        </PrivateRoute>
      </Switch>
    </Router>
  </ProvideAuth>;
}

function PrivateRoute({ children, ...rest }) {

  const [user] = useAuth();

  return (
    <Route
      {...rest}
      render={({ location }) =>
        user && user.token ? (
          children
        ) : (
            <Redirect
              to={{
                pathname: "/login",
                state: { from: location }
              }}
            />
          )
      }
    />
  );
}


function Taskroulette() {
  const [drawer, setDrawer] = useState(Drawers.CLOSED);
  const [content, setContent] = useState(Content.WORK);

  const openDrawer = drawer => setDrawer(drawer);
  const onDrawerClose = () => setDrawer(Drawers.CLOSED);
  const openContent = content => setContent(content);

  const { t } = useTranslation();

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
                <Tooltip content={t("SPRINTS")} position={Position.DOWN}>
                  <Icon
                    icon='walk'
                    iconSize={Icon.SIZE_LARGE}
                    intent={Intent.NONE}
                    onClick={() => openDrawer(Drawers.SPRINTS)}
                  />
                </Tooltip>
              </NavbarHeading>

              {
                <NavbarHeading>
                  <Tooltip content={t("WORK")} position={Position.DOWN}>
                    <Icon
                      icon='build'
                      iconSize={Icon.SIZE_LARGE}
                      intent={content === Content.WORK ? Intent.PRIMARY : Intent.NONE}
                      onClick={() => openContent(Content.WORK)}
                    />
                  </Tooltip>
                </NavbarHeading>
              }

              {
                <NavbarHeading>
                  <Tooltip content={t("TASKS")} position={Position.DOWN}>

                    <Icon
                      icon='projects'
                      iconSize={Icon.SIZE_LARGE}
                      intent={content === Content.TASKS ? Intent.PRIMARY : Intent.NONE}
                      onClick={() => openContent(Content.TASKS)}
                    />
                  </Tooltip>
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
