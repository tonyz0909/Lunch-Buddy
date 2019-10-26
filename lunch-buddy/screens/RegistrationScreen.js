import * as WebBrowser from 'expo-web-browser';
import React, { Component } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  TouchableHighlight,
  AlertIOS
} from 'react-native';
// import Icon from 'react-native-vector-icons/FontAwesome';
import { Text, Input, Button } from 'react-native-elements';
import { firebaseapp as fbase} from '../src/config';
// import * as firebase from 'firebase';

function newUser(name, email, phoneNumber) {
  fbase.firestore().ref('/users').push({
    name,
    email,
    phoneNumber
  }).then((data) => {
    //success callback
    console.log('data' , data)
  }).catch((error) => {
    //error callback
    console.log('error ', error)
  })
}

export default class LoginScreen extends Component {
  state = {
    email: '',
    phoneNumber: '',
    errorMessage: '',
  };

  handleChange(field, e) {
    console.log(this.state);
  }

  handleSubmit = () => {
    var user = fbase.auth().currentUser;
    var db = fbase.firestore();
    var profileRef = db.collection("users").doc(user.uid);
        var setWithMerge = profileRef.set({
            phoneNumber: this.state.phoneNumber,
            email: this.state.email
        }, { merge: true });
    this.props.navigation.navigate('Main')
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          {/* <Text style={styles.errorText}>{this.state.errorMessage}</Text> */}
          <Text h1 style={styles.title}>Contact Info</Text>
          <Text style={styles.textMedium}>To connect you to your buddies! </Text>
          <Text style={styles.textSmall}>If no additional email is supplied, we'll just use the 
          email registered to your Facebook account.</Text>
          <Input
            style={styles.textInput}
            placeholder='Updated Email (optional)'
            leftIcon={{ type: 'font-awesome', name: 'envelope', paddingRight: 10 }}
            onChangeText={email => this.setState({ email })}
            value={this.state.email}
          />

          <Input
            style={styles.textInput}
            placeholder='Phone Number'
            leftIcon={{ type: 'font-awesome', name: 'envelope', paddingRight: 10 }}
            onChangeText={phoneNumber => this.setState({ phoneNumber })}
            value={this.state.phoneNumber}
          />

          <Button 
            title="Done"
            style={styles.finishButton}
            onPress={() => this.handleSubmit()}
          />
        </View>
      </View>
    );
  }
}

LoginScreen.navigationOptions = {
  header: null,
};

function handleLearnMorePress() {
  WebBrowser.openBrowserAsync(
    'https://docs.expo.io/versions/latest/workflow/development-mode/'
  );
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
  textMedium: {
    textAlign: "center",
    fontSize: 30,
    marginBottom: 10, 
  },
  textSmall: {
    textAlign: "center",
    fontSize: 20,
    marginBottom: 20, 
  },
  button: {
    height: 45,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    marginTop: 10,
    alignSelf: 'stretch',
    justifyContent: 'center'
  },
  finishButton: {
    padding: 10,
    paddingTop: 20
  }
});