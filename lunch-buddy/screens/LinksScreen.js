import React, { Component } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Icon, Input, Image, ListItem, Text } from 'react-native-elements';
import { WebBrowser } from 'expo';
import { ExpoLinksView } from '@expo/samples';
import { firebaseapp as fbase } from '../src/config';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import API from '../api.json';
import { db } from '../src/config';
import snek from '../assets/images/snake.jpg';
import DateTimePicker from "react-native-modal-datetime-picker";
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

function newUser(fName, lName, email, phoneNumber) {
  db.ref('/users').push({
    fName,
    lName,
    email,
    phoneNumber
  }).then((data) => {
    //success callback
    console.log('data', data)
  }).catch((error) => {
    //error callback
    console.log('error ', error)
  })
}

let addItem = item => {
  db.ref('/items').push({
    name: item
  });
}

export default class LinksScreen extends Component {
  showDateTimePicker = () => {
    this.setState({ isDateTimePickerVisible: true });
  };
  hideDateTimePicker = () => {
    this.setState({ isDateTimePickerVisible: false });
  };
  handleDatePicked = date => {
    this.lunchstartstring = date.toLocaleTimeString('en-US');
    this.setState({ lunchStartDateTime: date });
    this.setState({ edits: { ...this.state.edits, start: this.lunchstartstring } })
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
    this.setState({ edits: { ...this.state.edits, end: this.lunchendstring } })
    this.hideDateTimePicker2();
  };

  handleLocationPicked = str => {
    this.setState({ locationPlaceID: str });
    console.log(this.state.locationPlaceID);
  }

  checkForFlakes = () => {
    let user = fbase.auth().currentUser;
    let db = fbase.firestore();
    let profileRef = db.collection("users").doc(user.uid);
    profileRef.onSnapshot(doc => {
      if (doc.exists) {
        data = doc.data();
        this.setState({
          flakeToday: data.flakeToday
        });
      } else {
        // doc.data() will be undefined in this case
        console.log("No such user!");
      }
    });
  }

  getRequest = () => {
    let user = fbase.auth().currentUser;
    let db = fbase.firestore();
    let profileRef = db.collection("requests").doc(user.uid);
    profileRef.onSnapshot(doc => {
      console.log('updated snapshot');
      if (doc.exists) {
        // console.log("Document data:", doc.data());
        // console.log("Start Time:", doc.data().startTime.toDate().toLocaleTimeString('en-US'))

        let url = 'https://maps.googleapis.com/maps/api/place/details/json?';
        let place_id = "place_id=" + doc.data().placeID.toString();
        let fields = "fields=name,formatted_address"
        let key = "key=" + API["googlemaps"]
        let requestReverseGeoCode = url + place_id + "&" + fields + "&" + key

        fetch(requestReverseGeoCode, {
          "method": "GET",
          "headers": {}
        })
        .then(response => response.json())
        .then((data => {
          // console.log("fetch response: " + JSON.stringify(data));
          let locationString = data.result.name + ", " + data.result.formatted_address
          this.setState({
            location: locationString,
            locationPlaceID: place_id,
            start: doc.data().startTime.toDate().toLocaleTimeString('en-US'),
            lunchStartDateTime: doc.data().startTime.toDate(),
            end: doc.data().endTime.toDate().toLocaleTimeString('en-US'),
            lunchEndDateTime: doc.data().endTime.toDate(),
            matched: doc.data().matched,
            match: doc.data().matchID,
            edits: {
              location: "Chipotle Mexican Grill, 540 17th St NW #420, Atlanta, GA 30318",
              start: "11:30am",
              end: "1:30pm",
            }
          });

            // query for name of matched person
          if (doc.data().matched) {
            let db = fbase.firestore();
            let profileRef = db.collection("users").doc(doc.data().matchID);
            profileRef.onSnapshot(doc => {
              if (doc.exists) {
                console.log(doc.data())
                this.setState({ match: doc.data().name })
              } else {
                "unable to get name of match";
              }
            });
          }
          else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
          }
        }));
      }
    });
  }

  constructor(props) {
    super(props);
    this.state = {
      titleText: '',
      view: 'view',
      location: 'Testing testing',
      start: '',
      end: '',
      matched: false,
      match: null,
      edits: {
        location: "Chipotle Mexican Grill, 540 17th St NW #420, Atlanta, GA 30318",
        start: "11:30am",
        end: "1:30pm",
      },
      isDateTimePickerVisible: false,
      isDateTimePickerVisible2: false,
      locationPlaceID: null, //string - place_id
      lunchStartDateTime: null, // datetime object - start 
      lunchEndDateTime: null, // datetime object - end
      flakeToday: false
    };
    this.lunchstartstring = "" // TEST start date time string 
    this.lunchendstring = ""
    this.getRequest = this.getRequest.bind(this);
    this.checkForFlakes = this.checkForFlakes.bind(this);
    // first and foremost, check for flakes
    this.checkForFlakes();
    this.getRequest();
  }

  flake = () => {
    Alert.alert('You flaker :(');
    this.setState({
      location: null
    });
    let user = fbase.auth().currentUser;
    let db = fbase.firestore();
    let profileRef = db.collection("users").doc(user.uid);
    // update flake status
    profileRef.update({
      flakeToday: true
    });

    // delete 'matchID' from matched person
    db.collection("requests").doc(user.uid).get().then(doc => {
      if (doc.exists) {
        matchID = doc.data().matchID;
        db.collection("requests").doc(matchID).set({
          matched: false,
          matchID: ''
        }, { merge: true });
      } else {
        console.log("match's request doc not found");
      }
      console.log("Request successfully deleted!");
    });

    // delete request
    db.collection("requests").doc(user.uid).delete().then(function () {
      console.log("Request successfully deleted!");
    }).catch(function (error) {
      console.error("Error removing document: ", error);
    });
  }

  submitEdits = () => {
    // Alert.alert(this.state.edits.location);
    // Alert.alert(this.state.edits.start);
    console.log("ON SUBMIT: " + this.state.locationPlaceID);

    let url = 'https://maps.googleapis.com/maps/api/place/details/json?';
    let place_id = "place_id=" + this.state.locationPlaceID;

    let fields = "fields=name,formatted_address"
    let key = "key=" + API["googlemaps"]
    let requestReverseGeoCode = url + place_id + "&" + fields + "&" + key
    console.log("ON submit: " + requestReverseGeoCode);
    fetch(requestReverseGeoCode, {
      "method": "GET",
      "headers": {}
    })
      .then(response => response.json())
      .then((data => {
        let locationString = data.result.name + ", " + data.result.formatted_address
        this.setState({
          location: locationString
        })
      }));


    this.setState({
      view: 'view',
    });

    if (this.state.lunchStartDateTime != null || this.lunchEndDateTime != null) {
      if (this.state.lunchStartDateTime > this.state.lunchEndDateTime) {
        Alert.alert("End Time is before Start Time!");
      } else {
        var user = fbase.auth().currentUser;
        var db = fbase.firestore();
        var profileRef = db.collection("requests").doc(user.uid).update({
          placeID: this.state.locationPlaceID,
          startTime: this.state.lunchStartDateTime,
          endTime: this.state.lunchEndDateTime,
        }).then(function () {
          Alert.alert("Fields have been Updated")
        });
      }
    } else {
      var user = fbase.auth().currentUser;
      var db = fbase.firestore();
      var profileRef = db.collection("requests").doc(user.uid).update({
        placeID: this.state.locationPlaceID,
        startTime: this.state.lunchStartDateTime,
        endTime: this.state.lunchEndDateTime,
      }).then(function () {
        Alert.alert("Fields have been Updated")
      });
    }
  }

  link = () => {
    Linking.openURL('fb-messenger://user-thread/heatwave23');
  }

  render() {
    return (
      <ScrollView style={styles.container}>
        {
          !this.state.flakeToday ?
            <View>
              {this.state.view === 'view' &&
                <View>
                  <ListItem
                    key={0}
                    title={<Text style={styles.boldText}>{"Location:"}</Text>}
                    subtitle={<Text style={styles.ratingText}>{this.state.location}</Text>}
                    bottomDivider
                  />
                  <ListItem
                    key={1}
                    title={<Text style={styles.boldText}>{"Lunch start time:"}</Text>}
                    subtitle={<Text style={styles.ratingText}>{this.state.start}</Text>}
                    bottomDivider
                  />
                  <ListItem
                    key={2}
                    title={<Text style={styles.boldText}>{"Lunch end time:"}</Text>}
                    subtitle={<Text style={styles.ratingText}>{this.state.end}</Text>}
                    bottomDivider
                  />
                  <ListItem
                    key={3}
                    title={<Text style={styles.boldText}>{"Matched?"}</Text>}
                    subtitle={<Text style={styles.ratingText}>{this.state.matched ? "Yes" : "No"}</Text>}
                    bottomDivider
                  />
                  {this.state.matched &&
                    <ListItem
                      key={4}
                      title={<Text style={styles.boldText}>{"Match: "}</Text>}
                      subtitle={<View style={styles.fixToTextBetween}><Text style={styles.ratingText}>{this.state.match}</Text><MaterialCommunityIcons name="facebook-messenger" size={32} color="#006AFF" onPress={this.link}/></View>}
                      bottomDivider
                    />
                  }
                  <View style={styles.fixToText}>
                  {!this.state.matched && <View><Button title="Edit" buttonStyle={styles.button} raised={true} onPress={() => this.setState({ view: "edit" })} /></View>}
                    <Button title="Flake" buttonStyle={styles.button} raised={true} onPress={this.flake} />
                  </View>
                </View>
              }
              
              {this.state.view === 'edit' &&
                <View>
                  {/* TODO LATER  */}
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
                            placeholder={this.state.location}
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
                  <ListItem
                    key={1}
                    title={
                      <View style={styles.times}>
                        <Text style={styles.boldText}>{"Start Time:"}</Text>
                        <Text style={styles.timeText}> {this.lunchstartstring ? this.lunchstartstring : this.state.start} </Text>
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
                    key={2}
                  title={
                    <View style={styles.times}>
                      <Text style={styles.boldText}>{"End Time:"}</Text>
                      <Text style={styles.timeText}>{this.lunchendstring ? this.lunchendstring : this.state.end} </Text>
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
                  <View style={styles.fixToText}>
                    <Button title="Cancel" buttonStyle={styles.button} raised={true} onPress={() => this.setState({ view: "view" })} />
                    <Button title="Save" buttonStyle={styles.button} raised={true} onPress={this.submitEdits} />
                  </View>
                </View>
              }
            </View>
            :
            <View style={styles.main}>
              < Text style={styles.boldTextCentered} >
                {"No lunch plan today :("}
              </Text >
              <Image source={snek} style={{ width: 210, height: 240 }} resizeMode="cover" PlaceholderContent={<ActivityIndicator />} />
              <View style={styles.fixToText}>
                <Button title="Create request" buttonStyle={styles.button} raised={true} onPress={() => this.setState({ location: "Chipotle Mexican Grill, 540 17th St NW #420, Atlanta, GA 30318" })} />
              </View>
            </View>
        }
      </ScrollView>
    );
  }
}

LinksScreen.navigationOptions = {
  title: 'Your Lunch Requests',
};

const styles = StyleSheet.create({
  timeText: {
    fontSize: 20,
  },
  times: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    margin: 10
  },
  subtitleFont: {
    fontWeight: "600",
  },
  main: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#ffffff',
    padding: 10,
    alignItems: 'center'
  },
  color: {
    backgroundColor: '#ffb380',
  },
  baseText: {
    fontSize: 18,
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
    justifyContent: 'space-around',
    margin: 10
  },
  fixToTextBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingText: {
    fontSize: 18,
    color: 'grey'
  },
  ratingTextLink: {
    fontSize: 18,
    color: '#0066ff'
  }
});
