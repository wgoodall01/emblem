import React from "react";
import "./Post.css";
import "./Compose.css";
import { connect } from "react-redux";
import { updateDraft, submitDraft, generateCredentials } from "actions.js";
import Button from "components/Button";
import LoadingSpinner from "components/LoadingSpinner";
import CredentialGenerator from "components/CredentialGenerator.js";
import LayoutContainer from "components/LayoutContainer.js";
import cu from "cryptoUtils.js";
import { Redirect } from "react-router";

/*
 * Sign the post with the user's credentials.
 * @param contents string The contents of the message.
 * @param credentials Object the credentials object.
 * @param onSubmit Function the post submit action.
 */
const processPost = (contents, credentials, onSubmit) => {
  let post = {};
  post.contents = contents;
  post.pubkey = credentials.public;
  post.hash = cu.hashList([credentials.public, contents]);
  post.signature = cu.sign(post.hash, credentials.private);
  onSubmit(post);
};

/*
 * Post editor.
 * 
 * reads state from the redux state.compose.*
 * Submits a submitDraft() action when post is clicked.
 */
const Composer = props =>
  props.isUnknownUser ? (
    <CredentialGenerator to="make a post" />
  ) : (
    <div className="Post">
      <textarea
        className="Post_editable"
        placeholder="Compose a post"
        onChange={e => props.onUpdate(e.target.value)}
        value={props.contents}
      />
      <LayoutContainer flexDirection="row-reverse">
        <Button
          outline
          label="Post"
          onClick={e =>
            processPost(props.contents, props.credentials, props.onSubmit)
          }
        />
        {props.isLoading ? <LoadingSpinner size="20" /> : undefined}
        {props.isError ? <div>{props.err}</div> : undefined}
        {props.latestId ? <Redirect to="/me" /> : undefined}
      </LayoutContainer>
    </div>
  );

const mapStateToProps = state => ({
  isUnknownUser: state.credentials.unknown,
  credentials: state.credentials,
  user: state.users[state.credentials.fingerprint] || {},

  contents: state.compose.contents,
  isLoading: state.compose.isLoading,
  isError: state.compose.isError,
  err: state.compose.err,
  latestId: state.compose.latestId
});

const mapDispatchToProps = {
  onUpdate: updateDraft,
  onSubmit: submitDraft,
  generateCredentials: generateCredentials
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Composer);
