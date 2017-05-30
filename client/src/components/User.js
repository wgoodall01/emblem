import React from "react";
import {connect} from "react-redux";
import Post from "components/Post";
import LoadingSpinner from "components/LoadingSpinner";
import {loadUser} from "actions.js";

class User extends React.PureComponent{
	constructor(props){
		super(props);
		props.loadUser(props.fingerprint);
	}

	render(){
		if(this.props.user.isLoading){return <LoadingSpinner/>}
		return (<div>
			<h1>{this.props.user.username || this.props.user.fingerprint.substring(0, 12)}</h1>
			<p>{this.props.user.bio || "Hi!"}</p>
			{this.props.posts.map(p => <Post
				name={this.props.user.username || this.props.user.fingerprint.substring(0, 12)}
				timestamp={new Date(p.timestamp).toString()}
				fingerprint={p.fingerprint}
				contents={p.contents}
				key={p.hash}
			/>)}
		</div>)
	}
}


const mapStateToProps = (state, ownProps) => {
	let isMe = ownProps.fingerprint === state.credentials.fingerprint;
	let user = state.users[ownProps.fingerprint];
	if(!user){user={isLoading:true};}
	let posts = (user.posts || []).map(id => state.posts[id]);

	return {isMe, user, posts};
}

const mapDispatchToProps = ({
	loadUser: loadUser
})

export default connect(mapStateToProps, mapDispatchToProps)(User);
