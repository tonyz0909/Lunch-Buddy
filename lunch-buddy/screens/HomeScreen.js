import * as WebBrowser from 'expo-web-browser';
import React, { Component } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { Button, Input, Icon, Text, ListItem } from 'react-native-elements';
import { MonoText } from '../components/StyledText';
import DateTimePicker from "react-native-modal-datetime-picker";
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import API from '../api.json';
import { firebaseapp as fbase} from '../src/config';
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import { Notifications } from 'expo';

//real time database
// function newRequest(placeID, startTime, endTime) {
//   matched = false;
//   db.ref('/requests').push({
//     //userID,
//     start,
//     end,
//     placeID,
//     matched,
//     //matchID
//   }).then((data) => {
//     //success callback
//     console.log('data' , data)
//   }).catch((error) => {
//     //error callback
//     console.log('error ', error)
//   })
// }

export default class HomeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDateTimePickerVisible: false,
      isDateTimePickerVisible2: false,
      locationPlaceID: null, //string - place_id
      lunchStartDateTime: null, // datetime object - start
      lunchEndDateTime: null, // datetime object - end
    };
    this.lunchstartstring = "" // TEST start date time string
    this.lunchendstring = "" // TEST end date time string
  }

  showDateTimePicker = () => {
    this.setState({ isDateTimePickerVisible: true });
  };
  hideDateTimePicker = () => {
    this.setState({ isDateTimePickerVisible: false });
  };
  handleDatePicked = date => {
    this.lunchstartstring = date.toLocaleTimeString('en-US');
    this.setState({ lunchStartDateTime: date });
    this.hideDateTimePicker();
  };

  showDateTimePicker2 = () => {
    this.setState({ isDateTimePickerVisible2: true });
  };
  hideDateTimePicker2 = () => {
    this.setState({ isDateTimePickerVisible2: false });
  };
  handleDatePicked2 = date => {
    this.lunchendstring = date.toLocaleTimeString('en-US');
    this.setState({ lunchEndDateTime: date });
    this.hideDateTimePicker2();
  };

  handleLocationPicked = str => {
    this.setState({ locationPlaceID: str });
  }

  handleSubmit = async () => {
    let user = fbase.auth().currentUser;
    // console.log(user);
    let db = fbase.firestore();
    let profileRef = db.collection("requests").doc(user.uid);
    let matchID = await this.searchForMatch(this.state.lunchStartDateTime, this.state.lunchEndDateTime, this.state.locationPlaceID, user.uid);
    let matched = this.matchID !== null;
    profileRef.set({
      userID: user.uid,
      startTime: this.state.lunchStartDateTime,
      endTime: this.state.lunchEndDateTime,
      placeID: this.state.locationPlaceID,
      matched,
      matchID: matchID
    }, { merge: true });
  }

  makeMatch = (newRequestUID, existingRequestUID) => {
    let profileRef = db.collection("requests").doc(existingRequestUID);
    return profileRef.update({
      matched: true,
      matchID: newRequestUID
    });
  }

  searchForMatch = async (start, end, locationID, userID) => {
    return new Promise((resolve, reject) => {
      let db = fbase.firestore();
      let requestsRef = db.collection("requests")
      requestsRef.get().then((querySnapshot) => {
        querySnapshot.forEach(function (doc) {
          // doc.data() is never undefined for query doc snapshots
          data = doc.data()
          console.log(doc.id, " => ", data);
          console.log(data.placeID);
          if (data.placeID === locationID) {
            if ((end.getTime() - data.startTime.seconds) / 60 >= 30
              || (data.endTime.seconds - start.getTime()) / 60 >= 30) {
              console.log("matched!")
              let profileRef = db.collection("requests").doc(data.userID);
              profileRef.update({
                matched: true,
                matchID: userID
              })
              return resolve(data.userID);
            }
          }
        });
        window.setTimeout(() => resolve(null), 5000);
      })
        .catch(function (error) {
          console.log("Error getting documents: ", error);
          reject();
        });
    })
  }

  submit = () => {
    if (this.state.locationPlaceID == null || this.state.lunchStartDateTime == null || this.state.lunchEndDateTime == null) {
      Alert.alert("One or more fields are empty");
    } else {
      if (this.state.lunchStartDateTime > this.state.lunchEndDateTime) {
        Alert.alert("End Time is before Start Time!");
      } else {
        //debug purposes
        let request = {
          location: this.state.locationPlaceID,
          startTime: this.state.lunchStartDateTime,
          endTime: this.state.lunchEndDateTime,
        }
        // console.log(request);
        //firebase entry
        this.handleSubmit();
        Alert.alert("request saved");
        //Alert.alert("test"); //Just to not crash stuff
      }
    }
  }

  registerForPushNotificationsAsync = async() => {
    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );
    let finalStatus = existingStatus;
  
    // only ask if permissions have not already been determined, because
    // iOS won't necessarily prompt the user a second time.
    if (existingStatus !== 'granted') {
      // Android remote notification permissions are granted during the app
      // install, so this will only ask on iOS
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }
  
    // Stop here if the user did not grant permissions
    if (finalStatus !== 'granted') {
      return;
    }
  
    // Get the token that uniquely identifies this device
    let token = await Notifications.getExpoPushTokenAsync();
  
    // POST the token to your backend server from where you can retrieve it to send push notifications.
    var profileRef = fbase.firestore().collection("users").doc(this.currentUser.uid);
    var setWithMerge = profileRef.set({
      pushToken : {token}
    }, { merge: true });
  }

  sendPushNotification = (pushToken) => {
    let response = fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: {pushToken},
        sound: 'default',
        title: 'Demo',
        body: 'Demo notificaiton'
      })
    });
  };

  async componentDidMount() {
    this.currentUser = fbase.auth().currentUser;
    await this.registerForPushNotificationsAsync();
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}>
          <View style={styles.inputs}>
            <ListItem
              key={0}
              title={
                <Text style={styles.times}>
                  <Text style={styles.boldText}>{"Enter Location:"}</Text>
                </Text>
              }
              subtitle={
                //TODO fix the double click
                <View style={styles.times}>
                <ScrollView>

                <GooglePlacesAutocomplete
                  placeholder='Location Search'
                  minLength={2}
                  autoFocus={false}
                  returnKeyType={'search'}
                  listViewDisplayed='true'
                  fetchDetails={true}
                  renderDescription={row => row.description}
                  onPress={
                    (data, details = null) => { // 'details' is provided when fetchDetails = true
                      // console.log(data.place_id)
                      this.handleLocationPicked(data.place_id)
                    }}
                  styles={{
                    textInputContainer: {
                      backgroundColor: 'rgba(0,0,0,0)',
                      borderTopWidth: 0,
                      borderBottomWidth: 1,
                      borderColor: "black",
                    },
                    textInput: {
                      fontWeight: '400',
                      fontSize: 18,
                    },
                    description: {
                      fontWeight: '200',
                      fontSize: 14, //TODO side scrolling?
                    }
                  }}
                  getDefaultValue={() => ''}
                  query={{
                    // available options: https://developers.google.com/places/web-service/autocomplete
                    key: API["googlemaps"],
                    language: 'en', // language of the results
                  }}
                  nearbyPlacesAPI='GooglePlacesSearch'
                  GooglePlacesSearchQuery={{
                    // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
                    rankby: 'distance',
                  }}
                />
                </ScrollView>
                </View>
              }
              bottomDivider
            />
          </View>


          <View style={styles.inputs}>
            <ListItem
              key={0}
              title={
                <View style={styles.times}>
                  <Text style={styles.boldText}>{"Start Time:"}</Text>
                  <Text style={styles.timeText}> {this.lunchstartstring ? this.lunchstartstring : "12:00:00 PM"} </Text>
                  <View>
                    <Icon name='edit' onPress={this.showDateTimePicker} />
                    <DateTimePicker
                      isVisible={this.state.isDateTimePickerVisible}
                      onConfirm={this.handleDatePicked}
                      onCancel={this.hideDateTimePicker}
                      datePickerModeAndroid="calendar"
                      mode="datetime"
                    />
                  </View>
                </View>
              }
              bottomDivider
            />
            <ListItem
              key={1}
              title={
                <View style={styles.times}>
                  <Text style={styles.boldText}>{"End Time:"}</Text>
                  <Text style={styles.timeText}>{this.lunchendstring ? this.lunchendstring : "2:00:00 PM"} </Text>
                  <View>
                    <Icon name='edit' onPress={this.showDateTimePicker2} />
                    <DateTimePicker
                      isVisible={this.state.isDateTimePickerVisible2}
                      onConfirm={this.handleDatePicked2}
                      onCancel={this.hideDateTimePicker2}
                      datePickerModeAndroid="calendar"
                      mode="datetime"
                    />
                  </View>
                </View>
              }
              bottomDivider
            />
          </View>

          {/* Test stuff */}
          {/* <Text style={styles.getStartedText}>
            {this.lunchstartstring}
          </Text> */}
          {/* <Text style={styles.getStartedText}>
            This is a string: {this.state.locationPlaceID}
          </Text> */}
          <View>
            <ListItem
              key={0}
              title={
                <View style={styles.fixToText}>
                  <Button title="Submit Request!" buttonStyle={styles.button} raised={true} onPress={this.submit} />
                </View>
              }
            />
          </View>
        </ScrollView>
      </View>
    );
  }
}



HomeScreen.navigationOptions = {
  header: null,
};

function DevelopmentModeNotice() {
  if (__DEV__) {
    const learnMoreButton = (
      <Text onPress={handleLearnMorePress} style={styles.helpLinkText}>
        Learn more
      </Text>
    );

    return (
      <Text style={styles.developmentModeText}>
        Development mode is enabled: your app will be slower but you can use
        useful development tools. {learnMoreButton}
      </Text>
    );
  } else {
    return (
      <Text style={styles.developmentModeText}>
        You are not in development mode: your app will run at full speed.
      </Text>
    );
  }
}

HomeScreen.navigationOptions = {
  title: "Create Request",
};

function handleLearnMorePress() {
  WebBrowser.openBrowserAsync(
    'https://docs.expo.io/versions/latest/workflow/development-mode/'
  );
}

function handleHelpPress() {
  WebBrowser.openBrowserAsync(
    'https://docs.expo.io/versions/latest/workflow/up-and-running/#cant-see-your-changes'
  );
}

const styles = StyleSheet.create({
  timeText: {
    fontSize: 16,
  },
  inputs: {
    flex: 1,
  },
  boldText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  ratingText: {
    fontSize: 20,
    color: 'grey',
  },
  fixToText: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 10
  },
  times: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    margin: 10
  },
  button: {
    width: 160
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
