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

export default class LoginScreen extends Component {

  state = {
    email: '',
    password: '',
    errorMessage: '',
  };

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

          <Button 
            title="Log In"
            style={styles.loginButton}
            onPress={() => this.props.navigation.navigate('Home')}
          />
    
          {/* <TouchableOpacity
            style={styles.signUpButton}
            onPress={() => this.props.navigation.navigate('Home')}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
                style={styles.clearButton}
                onPress={() => this.props.navigation.navigate('SignUp')}>
                <Text style={styles.loginText}>Don't have an account?</Text>
          </TouchableOpacity> */}
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
    
  }
});
