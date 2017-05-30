import React from "react";
import {connect} from "react-redux";
import Post from "components/Post";
import {loadUser} from "actions.js";

class User extends React.PureComponent{
	constructor(props){
		super(props);
		props.loadUser(props.match.params.id);
	}

	render(){
		if(this.props.user.isLoading){return <div>Loading...</div>}
		return (<div>
			<h1>{this.props.user.username || this.props.user.fingerprint.substring(0, 12)}</h1>
			<pre>{JSON.stringify(this.props.user, null, 3)}</pre>
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
	const user = state.users[ownProps.match.params.id];
	if(!user){return {user:{isLoading:true}, posts:[]}}
	const posts = (user.posts || []).map(id => state.posts[id]);
	return {user, posts};
}

const mapDispatchToProps = ({
	loadUser: loadUser
})

export default connect(mapStateToProps, mapDispatchToProps)(User);
