import { useState, useEffect } from "react";
import firebase from "firebase/app";
import "firebase/auth";
import {
  useAuthState,
  useCreateUserWithEmailAndPassword
} from "react-firebase-hooks/auth";
import { useLocation } from "react-router-dom";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID
};

const Button = (props) => {
  const { id, label, onClick, className } = props;
  return (
    <div>
      <button id={id} onClick={onClick} className={className}>
        {label}
      </button>
    </div>
  );
};

const Field = (props) => {
  const { type, id, value, onChange, label } = props;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input type={type} id={id} value={value} onChange={onChange} />
    </div>
  );
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app();
}

const auth = firebase.auth();

function Login(props) {
  const [
    authenticatedUser,
    isAuthenticating,
    hasAuthenticationError
  ] = useAuthState(auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [createUserWithEmailAndPassword] = useCreateUserWithEmailAndPassword(
    auth
  );
  const [errorMsg, setErrorMsg] = useState("");
  const location = useLocation();

  useEffect(() => {
    console.log("authenticatedUser", authenticatedUser);
    setErrorMsg("");
    if (authenticatedUser && !location.state) {
      const displayName = authenticatedUser.email.split("@")[0];
      props.history.push({
        pathname: "/",
        state: { username: displayName }
      });
    }
  }, [authenticatedUser]);

  useEffect(() => {
    console.log(location);
    try {
      if (location.state.action === "sign out") {
        signOut();
      }
    } catch {}
  }, [location]);

  const signUp = () => {
    if (!email.length || !password.length) return;
    createUserWithEmailAndPassword(email, password).catch((error) => {
      setErrorMsg(error.message);
    });
  };

  const signIn = () => {
    if (!email.length || !password.length) return;
    setIsSigningIn(true);
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .catch((error) => {
        setErrorMsg(error.message);
      });
    setIsSigningIn(false);
  };

  const signOut = () => {
    setEmail("");
    setPassword("");
    location.state = undefined;
    firebase
      .auth()
      .signOut()
      .catch((error) => {
        setErrorMsg(error.message);
      });
  };

  if (hasAuthenticationError) {
    return (
      <div>
        <h1>Error: {hasAuthenticationError.message}</h1>
      </div>
    );
  }

  if (isAuthenticating || isSigningIn) {
    return (
      <div>
        <h2>Currently authenticating...</h2>
      </div>
    );
  }

  if (!authenticatedUser) {
    return (
      <div className="Login">
        {errorMsg && <div className="error-msg">{errorMsg}</div>}
        <div className="header-main">
          <div className="website-name">HolidayList</div>
          <div className="form">
            <Field
              type="text"
              id="email-address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              label="Email Address"
            />
            <Field
              type="password"
              id="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              label="Password"
            />
            <div className="form-btn-area">
              <Button
                id="login"
                label="Login"
                onClick={signIn}
                className="form-btn"
              />
              <div> or </div>
              <Button
                id="register"
                label="Register"
                onClick={signUp}
                className="form-btn"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>Loading page...</h2>
    </div>
  );
}

export default Login;
