import React from "react"
import {Link} from "react-router-dom";
import LayoutContainer from "components/LayoutContainer.js";

import "./Post.css"

/*
 * Displays a post.
 *
 * Props:
 * post - the post object to display.
 */
const Post = (props) => (<div className="Post">
	<LayoutContainer justifyContent="space-between" className="Post_info-container">
		<div className="Post_author">
			<Link to={`/user/${props.post.fingerprint}`}>
				{props.post.username || props.post.fingerprint.substring(0, 12)}</Link>
		</div>
		{!props.post.isValid?<div>INVALID POST</div>:undefined}
		<div className="Post_timestamp">{new Date(props.post.timestamp).toString()}</div>
	</LayoutContainer>
	<div className="Post_contents">{props.post.contents}</div>
</div>)

export default Post;
