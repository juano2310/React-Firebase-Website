
import React from 'react';
import firebase from 'firebase';
import {inject, observer} from 'mobx-react';
import axios from 'axios';

// Required for side-effects
require('firebase/firestore');

const config = {
  apiKey: process.env.REACT_APP_FIREBASE_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID
};

firebase.initializeApp(config);

export const db = firebase.firestore();
export const firebaseAuth = firebase.auth;
export const storage = firebase.storage();

// Configure FirebaseUI.
export const uiConfig = {
  // Popup signin flow rather than redirect flow (
  // Note that on mobile devices, redirect will be used regardless)
  signInFlow: 'popup',
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.FacebookAuthProvider.PROVIDER_ID,
	firebase.auth.EmailAuthProvider.PROVIDER_ID,
	//firebase.auth.TwitterAuthProvider.PROVIDER_ID
  ],

  // Redirect to /LoggedIn after sign in is successful.
  // Alternatively you can provide a callbacks.signInSuccess function.
  // signInSuccessUrl: '/LoggedIn',
  callbacks: {
	signInSuccess: () => {
	return false; // Avoid redirects after sign-in.
	}
  }
};

//TODO: this doesn't need to be a component, could just be access the observed variables vanilla
class AuthService extends React.Component {

  componentDidMount = () => {
    // Displays the login screen (so that the user sees its loading indicator) if the url has the has #login
    // (this happens when firebase redirects the browser back to to the app to complete the login flow)
    this.props.auth.checkLogin();

    firebase.auth().onAuthStateChanged((user) => {
      console.log("Auth state changed:", user);
      this.props.auth.setCurrentUser(user);
      if (user) {
		saveUser(user);
		//storePhoto(user);
        this.props.auth.loginHide();
      }
    });
  };

  render() {
    return (
      <div></div>
    );
  }
}

export default inject('auth')(observer(AuthService));

export function saveUser(user) {
  return db
    .collection("users").doc(user.uid)
    .set({
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
	  emailVerified: user.emailVerified,
    })
    .then(docRef => docRef)
    .catch(function(error) {
      console.error('Error adding document: ', error);
    });
}

export function storePhoto(user) {
	var fileName = 'users/'+ user.uid +'.jpg';
	var downloadURL = null;
	var storageRef = storage.ref();
	var photoRef = storageRef.child(fileName);
	var file = axios
      .get(user.photoURL, {
        responseType: 'arraybuffer'
      })
      .then(response => new Buffer(response.data, 'binary').toString('base64'))
	file.then(function(value) {
		var uploadTask = photoRef.putString(value, 'base64');
		uploadTask.on('state_changed', function(snapshot){
		  // Observe state change events such as progress, pause, and resume
		  // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
		  var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
		  console.log('Upload is ' + progress + '% done');
		  switch (snapshot.state) {
		    case firebase.storage.TaskState.PAUSED: // or 'paused'
		      console.log('Upload is paused');
		      break;
		    case firebase.storage.TaskState.RUNNING: // or 'running'
		      console.log('Upload is running');
		      break;
			default:
		  }
		}, function(error) {
			console.error('Error updating photo: ', error);
		}, function() {
			// Handle successful uploads on complete
			downloadURL = uploadTask.snapshot.downloadURL;
			db.collection("users").doc(user.uid)
			.set({
			  storedPhoto: downloadURL,
			}, { merge: true })
			.then(docRef => docRef)
			.catch(function(error) {
			  console.error('Error updating document: ', error);
			});
		});
	});
}
