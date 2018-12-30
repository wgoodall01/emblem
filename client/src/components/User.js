import React from "react";
import { connect } from "react-redux";
import Post from "components/Post";
import Compose from "components/Compose.js";
import LoadingSpinner from "components/LoadingSpinner";
import "./User.css";
import { loadUser, updateUser, submitUser } from "actions.js";
import cu from "cryptoUtils.js";

import { animated, Trail } from "react-spring";

/*
 * Displays a user.
 * If it's you, it lets you edit yourself.
 *
 * Props:
 * fingerprint - the fingerprint of the user to display.
 */
class User extends React.PureComponent {
  constructor(props) {
    super(props);
    this.load();
  }

  load() {
    this.props.loadUser(this.props.fingerprint);
  }

  onChange(e) {
    const newUser = { ...this.props.user };
    newUser[e.target.name] = e.target.value;
    this.props.updateUser(newUser);
  }

  sendChanges(e) {
    const newUser = { ...this.props.user };
    newUser.username =
      newUser.username || this.props.user.fingerprint.substring(0, 12);
    newUser.bio = newUser.bio || "Hi!";
    newUser.pubkey = this.props.credentials.public;
    const hash = cu.hashList([newUser.pubkey, newUser.username, newUser.bio]);
    newUser.signature = cu.sign(hash, this.props.credentials.private);
    this.props.submitUser(newUser);
  }

  render() {
    if (this.props.user.isLoading) {
      return <LoadingSpinner />;
    }

    const name =
      typeof this.props.user.username === "undefined"
        ? this.props.user.fingerprint.substring(0, 12)
        : this.props.user.username;

    const bio =
      typeof this.props.user.bio === "undefined" ? "Hi!" : this.props.user.bio;

    return (
      <div className="User">
        <div className="User_left">
          {this.props.isMe ? (
            <h1>
              <input
                className="User_input"
                name="username"
                onChange={e => this.onChange(e)}
                onBlur={e => this.sendChanges(e)}
                value={name}
              />
            </h1>
          ) : (
            <h1>{name}</h1>
          )}
          {this.props.isMe ? (
            <textarea
              className="User_input"
              name="bio"
              onChange={e => this.onChange(e)}
              onBlur={e => this.sendChanges(e)}
              value={bio}
            />
          ) : (
            <p>{bio}</p>
          )}
          {this.props.isMe ? (
            <div className="User_input-edit">(click username/bio to edit)</div>
          ) : (
            undefined
          )}
        </div>
        <div className="User_right">
          {this.props.isMe ? <Compose /> : undefined}
          <Trail
            native
            items={this.props.posts}
            keys={p => p.hash}
            from={{ transform: "translate3d(0, 40px, 0)", opacity: 0 }}
            to={{ transform: "translate3d(0, 0px, 0)", opacity: 1 }}
          >
            {item => props => (
              <animated.div style={props}>
                <Post post={item} />
              </animated.div>
            )}
          </Trail>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  let isMe = ownProps.fingerprint === state.credentials.fingerprint;
  let user = state.users[ownProps.fingerprint];
  if (!user) {
    user = { isLoading: true };
  }
  let posts = (user.posts || []).map(id => state.posts[id]);

  return { isMe, user, posts, credentials: state.credentials };
};

const mapDispatchToProps = {
  loadUser,
  updateUser,
  submitUser
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(User);
