import React, { Component} from "react";

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

class App extends Component {
  constructor () {
    super();

    this.state = {
      drawer: Drawers.CLOSED,
      content: Content.WORK
    };
  }

  openDrawer (drawer) {
    this.setState({...this.state, drawer});
  }

  onDrawerClose () {
    return () => this.openDrawer(Drawers.CLOSED);
  }

  openContent (content) {
    this.setState({...this.state, content});
  }

  render () {
    const {drawer, content} = this.state;

    return (
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
            onClose={this.onDrawerClose()}
          />
          <header>
          <Navbar style={{flexGrow: 1}}>
          <NavbarGroup align={Alignment.LEFT}>
            <NavbarHeading>
              <Icon 
                icon='walk' 
                iconSize={Icon.SIZE_LARGE} 
                intent={Intent.PRIMARY} 
                onClick={() => this.openDrawer(Drawers.SPRINTS)}
              />
            </NavbarHeading>

            {
              content!==Content.WORK && 
              <NavbarHeading>
                <Icon 
                  icon='build' 
                  iconSize={Icon.SIZE_LARGE}
                  intent={Intent.PRIMARY} 
                  onClick={() => this.openContent(Content.WORK)}
                />
              </NavbarHeading>
            }

            {
              content!==Content.TASKS && 
              <NavbarHeading>
                  <Icon 
                    icon='projects' 
                    iconSize={Icon.SIZE_LARGE}
                    intent={Intent.PRIMARY} 
                    onClick={() => this.openContent(Content.TASKS)}
                  />
              </NavbarHeading>
            }
          </NavbarGroup>
          </Navbar>
          </header>
            {content === Content.WORK && <Work />}
            {content === Content.TASKS && <Tasks />}
        </section>
    );
  }
}

export default App;
