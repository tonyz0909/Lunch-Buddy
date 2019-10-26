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
import { db as firebase } from '../src/config';
import Expo from 'expo';
import * as Constants from 'expo-constants';
// import { AccessToken, LoginButton } from 'react-native-fbsdk';
// var FBLoginButton = require('./FBLoginButton');
import FBLoginButton from './FBLoginButton';

export default class LoginScreen extends Component {

  // state = {
  //   email: '',
  //   password: '',
  //   errorMessage: '',
  // };

  async loginHandler() {
    const FBSDK = require('react-native-fbsdk');
    const {
      LoginManager,
    } = FBSDK;

    const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
    if (result.isCancelled) {
      throw new Error('User cancelled the login process');
    }

    const data = await AccessToken.getCurrentAccessToken();
    if (!data) {
      throw new Error('Something went wrong obtaining access token');
    }

    const credential = firebase.auth.FacebookAuthProvider.credential(data.accessToken);
    await firebase.auth().signInWithCredential(credential);
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          {/* <Text style={styles.errorText}>{this.state.errorMessage}</Text> */}
          <Text h1 style={styles.title}>Lunch Buddy</Text>
          <Text style={styles.subtitle}>Never eat lunch alone again!</Text>
          <Input
            style={styles.textInput}
            placeholder='Username'
            leftIcon={{ type: 'font-awesome', name: 'envelope', paddingRight: 10 }}
          />

          <Input
            style={styles.textInput}
            placeholder='Password'
            leftIcon={{ type: 'font-awesome', name: 'lock', paddingLeft: 5, paddingRight: 15 }}
          />
          <FBLoginButton />
          
          <Button 
            title="Log In"
            style={styles.loginButton}
            // onPress={() => this.props.navigation.navigate('Main')}
            onPress={() => this.loginHandler()}
          />
        </View>
      </View>
    );
  }
}

async function signInWithFacebook() {
  const appId = Expo.Constants.manifest.extra.facebook.appId;
  const permissions = ['public_profile', 'email'];  // Permissions required, consult Facebook docs
  
  const {
    type,
    token,
  } = await Expo.Facebook.logInWithReadPermissionsAsync(
    appId,
    {permissions}
  );

  switch (type) {
    case 'success': {
      await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);  // Set persistent auth state
      const credential = firebase.auth.FacebookAuthProvider.credential(token);
      const facebookProfileData = await firebase.auth().signInAndRetrieveDataWithCredential(credential);  // Sign in with Facebook credential

      // Do something with Facebook profile data
      // OR you have subscribed to auth state change, authStateChange handler will process the profile data
      console.log("successful auth")
      return Promise.resolve({type: 'success'});
    }
    case 'cancel': {
      console.log("failed auth")
      return Promise.reject({type: 'cancel'});
    }
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
