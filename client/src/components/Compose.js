import React from "react";
import "./Post.css";
import "./Compose.css";
import {connect} from "react-redux";
import {updateDraft, submitDraft, generateCredentials} from "actions.js";
import Button from "components/Button";
import CredentialGenerator from "components/CredentialGenerator.js";
import LayoutContainer from "components/LayoutContainer.js";
import cu from "cryptoUtils.js";
import {Redirect} from "react-router";


const processPost = (contents, credentials, onSubmit) => {
	let post = {}
	post.contents = contents;
	post.pubkey = credentials.public;
	post.hash = cu.hashList([credentials.public, contents]);
	post.signature = cu.sign(post.hash, credentials.private);
	onSubmit(post);
}

const Composer = props => (
	props.isUnknownUser?
	<CredentialGenerator to="make a post"/>
	: 
	<div className="Post">
		<div className="Post_author Post_info-container">
			{props.user.username || props.credentials.fingerprint.substring(0, 12)}
		</div>
		<textarea 
			className="Post_editable" 
			onChange={e => props.onUpdate(e.target.value)}
			value={props.contents}/>
		<LayoutContainer flexDirection="row-reverse">
			<Button 
				label="Post" 
				onClick={e => processPost(props.contents, props.credentials, props.onSubmit)}/>
			{props.isError?<div>{props.err}</div>:undefined}
			{props.latestId?<Redirect to="/me"/>:undefined} 
		</LayoutContainer>
	</div>
)

const mapStateToProps = state => ({
	isUnknownUser: state.credentials.unknown,
	credentials: state.credentials,
	user:state.users[state.credentials.fingerprint] || {},

	contents: state.compose.contents,
	isLoading: state.compose.isLoading,
	isError: state.compose.isError,
	err: state.compose.err,
	latestId: state.compose.latestId,
	
})

const mapDispatchToProps = {
	onUpdate: updateDraft,
	onSubmit: submitDraft,
	generateCredentials: generateCredentials,
}

export default connect(mapStateToProps, mapDispatchToProps)(Composer);
