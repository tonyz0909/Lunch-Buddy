import * as WebBrowser from 'expo-web-browser';
import React, { Component } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput
} from 'react-native';
// import Icon from 'react-native-vector-icons/FontAwesome';
import { Text, Input, Button } from 'react-native-elements';
import { firebaseapp as fbase, db } from '../src/config';
// import { Facebook } from 'expo';
import * as Facebook from 'expo-facebook';
// import { AccessToken, LoginButton } from 'react-native-fbsdk';

export default class LoginScreen extends Component {
  // async signInWithFacebook() {
  //   var provider = new fbase.auth.FacebookAuthProvider();
  //   fbase.auth().signInWithRedirect(provider);

  //   fbase.auth().getRedirectResult().then(function(result) {
  //     if (result.credential) {
  //       // This gives you a Facebook Access Token. You can use it to access the Facebook API.
  //       var token = result.credential.accessToken;
  //       // ...
  //     }
  //     // The signed-in user info.
  //     var user = result.user;

  //     console.log(result);
  //   }).catch(function(error) {
  //     // Handle Errors here.
  //     var errorCode = error.code;
  //     var errorMessage = error.message;
  //     // The email of the user's account used.
  //     var email = error.email;
  //     // The firebase.auth.AuthCredential type that was used.
  //     var credential = error.credential;
  //     // ...
  //   });
  // }

  async signInWithFacebook() {
    const appId = "592476948187357";
    const permissions = ['public_profile', 'email'];  // Permissions required, consult Facebook docs
    
    try {
      const {type, token} = await Facebook.logInWithReadPermissionsAsync(
        appId, {permissions});
      switch (type) {
        case 'success': {
          const response = await fetch(`https://graph.facebook.com/me?access_token=${token}`);
          var userInfo = await response.json();
          console.log(userInfo);
          this.signInFirebaseAccount(userInfo);

          return Promise.resolve({type: 'success'});
        }
        case 'cancel': {
          console.log("authentication cancelled")
          return Promise.reject({type: 'cancel'});
        }
      }
    } catch ({ message }) {
      alert(`Facebook Login Error: ${message}`);
    }
  }

  signInFirebaseAccount(userInfo) {
    var token = userInfo.id + "@gmail.com";
    fbase.auth().createUserWithEmailAndPassword(token, userInfo.id)
    .then(() =>  {
        db.ref("/users").push({
          name: userInfo.name,
          fbID: userInfo.id
        }).then(() => this.props.navigation.navigate('Home'));
    }).catch(error => {
      if (error.code === 'auth/email-already-in-use') {
        // User account already exists, sign in
        fbase.auth().signInWithEmailAndPassword(token, userInfo.id).catch(function(error) {
          alert(error.code + ": " + error.message);
        });
        this.props.navigation.navigate('Home');
      } else {
        console.log(error.code);
        alert(error.code + ": " + error.message);
      }
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <Text h1 style={styles.title}>Lunch Buddy</Text>
          <Text style={styles.subtitle}>Never eat lunch alone again!</Text>
          
          <Button 
            title="Log In With Facebook"
            style={styles.loginButton}
            // onPress={() => this.props.navigation.navigate('Main')}
            onPress={() => this.signInWithFacebook()}
          />

          <Button 
            title="Direct Enter"
            style={styles.loginButton}
            onPress={() => this.props.navigation.navigate('Main')}
            //onPress={() => this.signInWithFacebook()}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 30,
    justifyContent: 'center',
    // alignItems: 'center',
  },
  loginButton: {
    padding: 10,
    paddingTop: 20
  },
  textInput: {
    // padding: 0,
    margin: 0
  },
  title: {
    textAlign: "center",
    fontWeight: "bold"
  },
  subtitle: {
    textAlign: "center",
    fontSize: 20,
    marginBottom: 30,
    
  }
});
