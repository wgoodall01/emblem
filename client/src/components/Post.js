import React from "react"
import {Link} from "react-router-dom";
import LayoutContainer from "components/LayoutContainer.js";

import "./Post.css"

const Post = (props) => (<div className="Post">
	<LayoutContainer justifyContent="space-between" className="Post_info-container">
		<div className="Post_author">
			<Link to={`/user/${props.fingerprint}`}>{props.name}</Link>
		</div>
		<div className="Post_timestamp">{props.timestamp}</div>
	</LayoutContainer>
	<div className="Post_contents">{props.contents}</div>
</div>)

export default Post;
