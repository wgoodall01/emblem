import React from "react";
import {connect} from "react-redux";
import Post from "components/Post";
import Compose from "components/Compose.js"
import LoadingSpinner from "components/LoadingSpinner";
import {loadUser} from "actions.js";

class User extends React.PureComponent{
	constructor(props){
		super(props);
		this.load();
	}

	load(){
		this.props.loadUser(this.props.fingerprint);
	}

	render(){
		if(typeof this.props.fingerprint === "undefined"){return <h1>This user does not exist.</h1>}
		if(this.props.user.isLoading){return <LoadingSpinner/>}
		return (<div>
			<h1>{this.props.user.username || this.props.user.fingerprint.substring(0, 12)}</h1>
			<p>{this.props.user.bio || "Hi!"}</p>
			{this.props.isMe?<Compose/>:undefined}
			{this.props.posts.map(p => <Post key={p.hash} post={p}/>)}
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
