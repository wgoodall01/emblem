import React from "react";
import {connect} from "react-redux";
import CredentialGenerator from "components/CredentialGenerator.js";
import Post from "components/Post.js";
import {loadUser} from "actions.js";


class Me extends React.PureComponent{
	constructor(props){
		super(props);
		props.loadUser(props.fingerprint);
	}

	render(){
		if(this.props.user.isLoading){return <div>Loading...</div>}
		return (<div>
			<h1>Me</h1>
			{typeof this.props.fingerprint === "undefined"?
					<CredentialGenerator to="view your page"/>:
					<div>
						<h1>I am {this.props.user.username 
								|| this.props.fingerprint.substring(0, 12)}</h1>
						<pre>{JSON.stringify(this.props.user, null, 3)}</pre>
						{this.props.posts.map(p => <Post
							name={this.props.user.username 
									|| this.props.user.fingerprint.substring(0, 12)}
							timestamp={new Date(p.timestamp).toString()}
							fingerprint={p.fingerprint}
							contents={p.contents}
							key={p.hash}
						/>)}
					</div>
			}

		</div>)
	}
}

const mapStateToProps = (state) => {
	const fingerprint = state.credentials.fingerprint;
	const user = state.users[fingerprint];
	if(!user){return {user:{isLoading:true}, posts:[], fingerprint}}
	const posts = (user.posts || []).map(id => state.posts[id]);
	
	return {fingerprint, user, posts};
}

const mapDispatchToProps = ({
	loadUser: loadUser
})

export default connect(mapStateToProps, mapDispatchToProps)(Me);
