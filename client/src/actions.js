const cu = require("cryptoUtils.js");

/**
 * Redux action to add a post to the store.
 * @param post Object the post object to add.
 */
export function addPost(post) {
  return {
    type: "ADD_POST",
    post
  };
}

/**
 * Redux action to update a user in the store.
 *
 * @param user Object the user object to upsert.
 */
export function updateUser(user, flags) {
  return {
    type: "UPDATE_USER",
    user,
    ...flags
  };
}

/**
 * Redux action to load a user.
 *
 * @param id String a user identifier.
 */
export function loadUser(id) {
  return (dispatch, getState) => {
    const fingerprint = id;
    dispatch({ type: "SET_USER_LOADING", user: { fingerprint } });
    fetch(`/api/user/${encodeURIComponent(id)}`, { method: "GET" })
      .then(resp => resp.json())
      .then(json => {
        json.user.fingerprint = fingerprint; // if API has no record.
        dispatch(updateUser(json.user));
        dispatch(updateFeed(fingerprint, json.posts));
      })
      .catch(err => {
        dispatch(
          updateUser(
            { fingerprint },
            { isError: true, err: "Couldn't load user." }
          )
        );
      });
  };
}

/**
 * Update a feed from a list of posts.
 *
 * @param id String null if feed, fingerprint if user.
 * @param posts Array Array of post objects.
 */
export function updateFeed(id, posts) {
  return dispatch => {
    // Add the posts to the store
    posts.forEach(p => dispatch(addPost(p)));

    // Add the post IDs to a user
    const ids = posts.map(p => p.hash);
    dispatch({ type: "UPDATE_FEED", id, ids });
  };
}

/**
 * (re)load the feed.
 *
 * @param before Date (optional) Continuation load - get more posts.
 */
export function loadFeed(before) {
  return dispatch => {
    dispatch({ type: "SET_FEED_LOADING" });
    fetch("/api/feed", {
      method: "GET"
    })
      .then(resp => resp.json())
      .then(json => {
        dispatch({ type: "FEED_LOAD_RESULT" });
        dispatch(updateFeed(null, json.posts));
      })
      .catch(err => {
        dispatch({
          type: "FEED_LOAD_RESULT",
          isError: true,
          err: "Error loading feed."
        });
      });
  };
}

/**
 * Update the draft text.
 * @param text String the draft text.
 */
export function updateDraft(text) {
  return { type: "UPDATE_DRAFT", contents: text };
}

/**
 * Submit the draft post.
 * @param post Object the post object, with signatures computed.
 */
export function submitDraft(post) {
  return (dispatch, getState) => {
    dispatch({ type: "DRAFT_SEND" });
    fetch("/api/post", {
      method: "POST",
      body: JSON.stringify(post),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    })
      .then(response => response.json())
      .then(json => {
        // Add it to local state
        dispatch(updateFeed(getState().credentials.fingerprint, [json]));
        dispatch({
          type: "RECEIVE_DRAFT_RESPONSE",
          latestId: json.hash
        });
      })
      .catch(err => {
        console.log(err);
        dispatch({
          type: "RECEIVE_DRAFT_RESPONSE",
          isError: true,
          err: "Error submitting post. Try again later, perhaps?"
        });
      });
  };
}

/**
 * Submit a user's details.
 * @param user Object the user object.
 */
export function submitUser(user) {
  return dispatch => {
    fetch("/api/register", {
      method: "POST",
      body: JSON.stringify(user),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    })
      .then(response => response.json())
      .then(json => {
        dispatch(updateUser(json));
      })
      .catch(err => {
        console.log(err);
        dispatch(updateUser(user, { isError: true, err: "Couldn't save." }));
      });
  };
}

/**
 * Sets the credentials of the user.
 *
 * @param kp Object .public, .private.
 */
export function setCredentials(kp) {
  // Set the fingerprint as well
  const fingerprint = cu.hash(kp.public);
  return {
    type: "SET_CREDENTIALS",
    public: kp.public,
    private: kp.private,
    fingerprint
  };
}

/**
 * Generates new credentials for a user.
 * Also stores credentials to LocalStorage, so they don't evaporate.
 */
export function generateCredentials() {
  return dispatch => {
    dispatch({ type: "SET_CREDENTIALS_LOADING" });
    // Do this later, sometime after 'working' is displayed.
    setTimeout(() => {
      console.log("Generate key start");
      const kp = cu.generate();
      window.localStorage.setItem("credentials", JSON.stringify(kp));
      dispatch(setCredentials(kp));
    }, 100); // horrible nasty race condition
  };
}
