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
import { db } from '../src/config';

function newUser(fName, lName, email, phoneNumber) {
  db.ref('/users').push({
    fName,
    lName,
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
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    errorMessage: '',
  };

  handleChange(field, e) {
    console.log(this.state);
  }
  handleSubmit = () => {
    console.log(this.state.firstName);
    newUser(this.state.firstName, this.state.lastName, this.state.email, this.state.phoneNumber);
    AlertIOS.alert('User saved successfully');
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          {/* <Text style={styles.errorText}>{this.state.errorMessage}</Text> */}
          <Text h1 style={styles.title}>Become a Lunch Buddy!</Text>
          <Input
            style={styles.textInput}
            placeholder='FirstName'
            leftIcon={{ type: 'font-awesome', name: 'envelope', paddingRight: 10 }}
            onChangeText={firstName => this.setState({ firstName })}
            value={this.state.firstName}
          />
          <Input
            style={styles.textInput}
            placeholder='LastName'
            leftIcon={{ type: 'font-awesome', name: 'envelope', paddingRight: 10 }}
            onChangeText={lastName => this.setState({ lastName })}
            value={this.state.lastName}
          />
          <Input
            style={styles.textInput}
            placeholder='Email'
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
          <TouchableHighlight
            style={styles.button}
            underlayColor="white"
            onPress={this.handleSubmit}
          >
            <Text style={styles.buttonText}>Add</Text>
          </TouchableHighlight>
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
  subtitle: {
    textAlign: "center",
    fontSize: 20,
    marginBottom: 30,
    
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
  }
});