import React, { Component } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, Image } from 'react-native';
import { Button, Divider, Input, ListItem, Text } from 'react-native-elements';
import { ExpoConfigView } from '@expo/samples';
import profileImg from '../assets/images/profile_avatar.png';
import PropTypes from 'prop-types';
import RequestComponent from '../components/RequestComponent';

import { firebaseapp as fbase} from '../src/config';
import firebase from 'firebase';

export default class SettingsScreen extends Component {

  constructor(props) {
    super(props);

    this.state = {
      name: '',
      slug: '',
      description: "",
      email: '',
      phone: ''
    };
    this.populateValues = this.populateValues.bind(this)
  }

  populateValues() {
    userID = fbase.auth().currentUser.uid;
    var userRef = fbase.firestore().collection("users").doc(userID);

    userRef.get().then((doc) => {
      if (doc.exists) {
        var data = doc.data();
        this.setState({
          name: data.name,
          slug: data.username,
          description: data.tagline,
          email: data.email,
          phone: data.phoneNumber
        });
        
      } else {
          console.log("No such document!");
      }
    }).catch(function(error) {
      console.log("Error getting document:", error);
    });
  }

  render() {
    this.populateValues();
    return (
      <ScrollView style={styles.container}>
        <View style={styles.titleContainer}>
          <View style={styles.titleIconContainer}>
            <AppIconPreview iconUrl={null} />
          </View>

          <View style={styles.titleTextContainer}>
            <Text style={styles.nameText} numberOfLines={1}>
              {this.state.name}
            </Text>

            <Text style={styles.slugText} numberOfLines={1}>
              {this.state.slug}
            </Text>

            <Text style={styles.descriptionText}>{this.state.description}</Text>
          </View>
        </View>
        <Divider style={{ backgroundColor: 'gray' }} />
        <View style={styles.body}>
          <View style={styles.fixToText}>
            <Text style={styles.title}>
              Email:
            </Text>
            <Text>
              {this.state.email}
            </Text>
          </View>
          <View style={styles.fixToText}>
            <Text style={styles.title}>
              Phone:
            </Text>
            <Text>
              {this.state.phone}
            </Text>
          </View>
          <View style={styles.fixToText}>
            <Button title="Edit" buttonStyle={styles.button} raised={true} />
            <Button title="Flake My Account" buttonStyle={styles.button} raised={true} />
          </View>
        </View>
      </ScrollView >
    );
  }
}

/*
<View style={styles.container}>
        {this.state.items.length > 0 ? (
          <RequestComponent items={this.state.items} />
        ) : (
          <Text>No items</Text>
        )}
      </View>
      */

const AppIconPreview = ({ iconUrl }) => {
  if (!iconUrl) {
    iconUrl = 'https://s3.amazonaws.com/exp-brand-assets/ExponentEmptyManifest_192.png';
  }

  return <Image source={{ uri: iconUrl }} style={{ width: 64, height: 64 }} resizeMode="cover" />;
};

SettingsScreen.navigationOptions = {
  title: 'Profile',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  body: {
    flex: 1,
    padding: 15,
  },
  boldText: {
    fontSize: 18,
    fontWeight: "600"
  },
  button: {
    width: 160
  },
  fixToText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titleContainer: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 15,
    flexDirection: 'row',
    backgroundColor: "#ffffff"
  },
  titleIconContainer: {
    marginRight: 15,
    paddingTop: 2,
  },
  sectionHeaderContainer: {
    backgroundColor: '#fbfbfb',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ededed',
  },
  sectionHeaderText: {
    fontSize: 14,
  },
  sectionContentContainer: {
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 15,
  },
  sectionContentText: {
    color: '#808080',
    fontSize: 14,
  },
  nameText: {
    fontWeight: '600',
    fontSize: 18,
  },
  slugText: {
    color: '#a39f9f',
    fontSize: 14,
    backgroundColor: 'transparent',
  },
  descriptionText: {
    fontSize: 14,
    marginTop: 6,
    color: '#4d4d4d',
  },
  colorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorPreview: {
    width: 17,
    height: 17,
    borderRadius: 2,
    marginRight: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
  },
  colorTextContainer: {
    flex: 1,
  },
  title: {
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 10
  }
});

