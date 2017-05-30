import React from "react";
import {connect} from "react-redux";
import Post from "components/Post.js";
import {loadFeed} from "actions.js";

class Feed extends React.PureComponent{
	constructor(props){
		super(props);
		props.loadFeed();
	}

	render(){
		return (<div>
			<h1>Feed</h1>
			{this.props.isLoading?<div>Loading...</div>:undefined}
			{this.props.isError?
					<div>Error: {this.props.err.toString()}</div>
					:
				this.props.posts.map(p => <Post 
					name={p.username || p.fingerprint.substring(0, 12)} 
					fingerprint={p.fingerprint}
					timestamp={new Date(p.timestamp).toString()}
					contents={p.contents}
					key={p.hash}
				/>)
			}
		</div>)
	}
}

const mapStateToProps = (state) => ({
	posts: [...state.feed.posts.map(id => state.posts[id])],
	isLoading: state.feed.isLoading,
	isError: state.feed.isError,
	err: state.feed.err,
})

const mapDispatchToProps = ({
	loadFeed: loadFeed
})

export default connect(mapStateToProps, mapDispatchToProps)(Feed);
