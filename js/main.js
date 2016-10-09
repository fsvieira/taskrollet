// webpack main.js bundle.js --module-bind 'js=babel-loader'
// TODO: test if babel does the same as webpack
// https://tleunen.github.io/react-mdl/components/
// https://github.com/tleunen/react-mdl
// https://facebook.github.io/react/blog/2015/09/02/new-react-developer-tools.html
import React from 'react';
import ReactDOM from 'react-dom';
import { Textfield, Button, Card, CardTitle, CardActions} from 'react-mdl';

var NoTaskMessage = React.createClass({
  render: function() {
    // return <div>{this.props.message}</div>;
    return <div> 
		<Card shadow={0} style={{width: '100%', height: '7em', background: 'url(../images/jp-3-stones.png) center / cover', margin: 'auto'}}>
		<CardTitle expand />
		<CardActions style={{height: '52px', padding: '16px', background: 'rgba(0,0,0,0.6)'}}>
			<span style={{color: '#fff', fontSize: '14px', fontWeight: '500'}}>
				{this.props.message}
			</span>
		</CardActions>
		</Card>
	</div>
  }
});

var AddTask = React.createClass({
	render: function() {
		return <div>
			<Textfield
				onChange={() => {}}
				label="New task description!"
				rows={3}
				style={{width: '100%'}}
			/>
			<Button raised colored>Add</Button>
		</div>;
	}
});

function layout () {
	ReactDOM.render(
		<div>
			<div>Task Roulette</div>
			<NoTaskMessage message='There is no tasks... go outside and enjoy the day ;)' />
			<AddTask />
		</div>,
		document.getElementById('taskroulette')
	);
} 



function main () {
	/*ReactDOM.render(
	  <h1>Hello, world!</h1>,
	  document.getElementById('taskroulette')
	);*/
	layout();
}

var loadedStates = ['complete', 'loaded', 'interactive'];
if (loadedStates.includes(document.readyState) && document.body) {
  main();
} else {
  window.addEventListener('DOMContentLoaded', main, false);
}
