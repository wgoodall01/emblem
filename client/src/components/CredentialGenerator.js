import React from "react";
import Button from "components/Button.js";
import {generateCredentials} from "actions.js";
import {connect} from "react-redux";
import "./CredentialGenerator.css";

const CredentialGenerator = (props) => (<div className="CredentialGenerator">
	<h1>Create Account?</h1>
	<p>You need an account to {props.to}. To make one instantly, just click the button below. You can set up a username and bio later on.</p>
	<Button 
		inverse 
		label={props.isLoading?"Working...":"Let's go!"}
		onClick={e => props.generateCredentials()}
	/>
</div>)


const mapStateToProps = (state) => ({
	isLoading:state.credentials.isLoading
});

const mapDispatchToProps = ({
	generateCredentials: generateCredentials
})

export default connect(mapStateToProps, mapDispatchToProps)(CredentialGenerator);
