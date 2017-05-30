import React from "react";
import User from "components/User.js";
import {connect} from "react-redux";

const UserPage = (props) => (
	<User fingerprint={props.match.params.id}/>
)

const MePage = connect((state) => 
	({fingerprint:state.credentials.fingerprint}))(User);

export {UserPage, MePage};
