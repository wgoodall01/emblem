import React from "react";

import { NavLink } from "react-router-dom";
import "./Landing.css";

const Landing = () => (
  <div className="Landing">
    <div className="Landing_center">
      <h1>Emblem</h1>
      <h2>Concept for a cryptographically-verifiable social network</h2>
      <p>
        Social networking sites, like Twitter, are vital to many of our most
        important conversations. It’s vital to make sure that these
        conversations are displayed as we’ve intended them. By using
        cryptography, it is possible to make a social network which can’t be
        artificially manipulated, even by its owners.
      </p>
      <p>
        This project sets out to do just that. It uses cryptography to ensure
        that posts are exactly as their authors wrote them.
      </p>
      <div className="Landing_buttons">
        <NavLink className="Landing_link Landing_link-active" to="/feed">
          Let's Go!
        </NavLink>
        <a className="Landing_link" href="/About-Emblem.pdf">
          About Emblem
        </a>
      </div>
    </div>
  </div>
);

export default Landing;
