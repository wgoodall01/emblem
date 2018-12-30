import React from "react";
import { connect } from "react-redux";
import Post from "components/Post.js";
import LoadingSpinner from "components/LoadingSpinner";
import { loadFeed } from "actions.js";
import LayoutContainer from "components/LayoutContainer";
import Button from "components/Button";
import "./Feed.css";

import { animated, Trail } from "react-spring";

/*
 * Displays the post feed for all users.
 */
class Feed extends React.PureComponent {
  constructor(props) {
    super(props);
    props.loadFeed();
  }

  render() {
    return (
      <div className="Feed">
        <LayoutContainer justifyContent="space-between" alignItems="center">
          <h1>Feed</h1>
          <Button
            small
            inverse
            onClick={e => this.props.loadFeed()}
            label="Reload"
          />
        </LayoutContainer>
        {this.props.isLoading ? <LoadingSpinner /> : undefined}
        {this.props.isError ? (
          <div>Error: {this.props.err.toString()}</div>
        ) : (
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
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  posts: [...state.feed.posts.map(id => state.posts[id])],
  isLoading: state.feed.isLoading,
  isError: state.feed.isError,
  err: state.feed.err
});

const mapDispatchToProps = {
  loadFeed: loadFeed
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Feed);
