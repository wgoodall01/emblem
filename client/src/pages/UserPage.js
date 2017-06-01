import React from "react";
import User from "components/User.js";
import CredentialGenerator from "components/CredentialGenerator";
import {connect} from "react-redux";

const UserPage = (props) => (
	<User fingerprint={props.match.params.id}/>
)


/*
 * Displays a user's page.
 * This takes the fingerprint from the query parameter.
 * If you don't have an account, it prompts you to make one.
 */
let MePage = (props) => {
	if(typeof props.fingerprint === "undefined"){
		// User account doesn't exist.
		return <div style={{paddingTop:"20px"}}>
			<CredentialGenerator to="view your page"/>
		</div>
	}else{
		return <User fingerprint={props.fingerprint}/>
	}
}

const mapStateToProps = (state) => ({
	fingerprint:state.credentials.fingerprint
})

MePage = connect(mapStateToProps)(MePage);

export {UserPage, MePage};
