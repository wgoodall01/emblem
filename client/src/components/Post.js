import React from "react"

import "./Post.css"

const Post = (props) => (
	<div className="Post">
		<div className="Post_info-container">
			<div className="Post_author">{props.name}</div>
			<div className="Post_timestamp">{props.timestamp}</div>
		</div>
		<div className="Post_contents">{props.contents}</div>
	</div>
)

export default Post;
