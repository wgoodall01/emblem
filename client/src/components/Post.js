import React from "react";
import { Link } from "react-router-dom";
import LayoutContainer from "components/LayoutContainer.js";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import "./Post.css";

TimeAgo.addLocale(en);
const timeAgo = new TimeAgo("en-US");

/*
 * Displays a post.
 *
 * Props:
 * post - the post object to display.
 */
const Post = props => (
  <div className="Post" style={props.style}>
    <LayoutContainer
      justifyContent="space-between"
      className="Post_info-container"
    >
      <div className="Post_author">
        <Link to={`/user/${props.post.fingerprint}`}>
          {props.post.username || props.post.fingerprint.substring(0, 12)}
        </Link>
      </div>
      {!props.post.isValid ? (
        <div className="Post_invalid">INVALID POST</div>
      ) : (
        undefined
      )}
      <div className="Post_timestamp">
        {timeAgo.format(new Date(props.post.timestamp), "twitter")}
      </div>
    </LayoutContainer>
    <div className="Post_contents">{props.post.contents}</div>
  </div>
);

export default Post;
