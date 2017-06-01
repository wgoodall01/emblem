import React from "react";
import {connect} from "react-redux";
import Post from "components/Post.js";
import LoadingSpinner from "components/LoadingSpinner";
import {loadFeed} from "actions.js";
import LayoutContainer from "components/LayoutContainer";
import Button from "components/Button";

/*
 * Displays the post feed for all users.
 */
class Feed extends React.PureComponent{
	constructor(props){
		super(props);
		props.loadFeed();
	}

	render(){
		return (<div>
			<LayoutContainer justifyContent="space-between" alignItems="center">
				<h1>Feed</h1>
				<a href="#" onClick={e => this.props.loadFeed()}>   Reload</a>
			</LayoutContainer>
			{this.props.isLoading?<LoadingSpinner/>:undefined}
			{this.props.isError?
					<div>Error: {this.props.err.toString()}</div>
					:
				this.props.posts.map(p => <Post key={p.hash} post={p}/>)
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
