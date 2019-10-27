import React, { Component } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Input, Image, ListItem, Text } from 'react-native-elements';
import { ExpoLinksView } from '@expo/samples';
import { firebaseapp as fbase } from '../src/config';
import API from '../api.json';
import { db } from '../src/config';
import snek from '../assets/images/snake.jpg';

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

        fetch("https://maps.googleapis.com/maps/api/place/details/json?place_id=ChIJx9EaGRoE9YgR7Je8EHoBBRo&fields=name,formatted_address&key=AIzaSyCwt1IlfjmH9cOk3FOLkMr4sORPsL5PT68", {
          "method": "GET",
          "headers": {}
        })
          .then(response => response.json())
          .then((data => {
            // console.log("fetch response: " + JSON.stringify(data));
            let locationString = data.result.name + ", " + data.result.formatted_address
            this.setState({
              location: locationString,
              start: doc.data().startTime.toDate().toLocaleTimeString('en-US'),
              end: doc.data().endTime.toDate().toLocaleTimeString('en-US'),
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

          }))
          .catch(err => {
            console.log(err);
          });
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    });
  }

  constructor(props) {
    super(props);
    this.state = {
      // titleText: "Your Requests",
      // view: "view",
      // location: "Chipotle Mexican Grill, 540 17th St NW #420, Atlanta, GA 30318",
      // start: "11:30am",
      // end: "1:30pm",
      // matched: false,
      // match: null,
      // edits: {
      //   location: "Chipotle Mexican Grill, 540 17th St NW #420, Atlanta, GA 30318",
      //   start: "11:30am",
      //   end: "1:30pm",
      // }
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
      flakeToday: false
    };
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
    this.setState({
      view: 'view',
      location: this.state.edits.location,
      start: this.state.edits.start,
      end: this.state.edits.end,
    });
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
                      subtitle={<Text style={styles.ratingText}>{this.state.match}</Text>}
                      bottomDivider
                    />
                  }
                  <View style={styles.fixToText}>
                    <Button title="Edit" buttonStyle={styles.button} raised={true} onPress={() => this.setState({ view: "edit" })} />
                    <Button title="Flake" buttonStyle={styles.button} raised={true} onPress={this.flake} />
                  </View>
                </View>
              }
              {this.state.view === 'edit' &&
                <View>
                  <ListItem
                    key={0}
                    title={<Text style={styles.boldText}>{"Location:"}</Text>}
                    subtitle={
                      <Input
                        style={styles.subtitleFont}
                        placeholder={this.state.location}
                        onChangeText={text => this.setState({ edits: { ...this.state.edits, location: text } })}
                      />
                    }
                    bottomDivider
                  />
                  <ListItem
                    key={1}
                    title={<Text style={styles.boldText}>{"Lunch start time:"}</Text>}
                    subtitle={
                      <Input
                        placeholder={this.state.start}
                        onChangeText={text => this.setState({ edits: { ...this.state.edits, start: text } })} />

                    }
                    bottomDivider
                  />
                  <ListItem
                    key={2}
                    title={<Text style={styles.boldText}>{"Lunch end time:"}</Text>}
                    subtitle={<Input
                      placeholder={this.state.end}
                      onChangeText={text => this.setState({ edits: { ...this.state.edits, end: text } })} />}
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

// export default class LinksScreen extends Component {
//   state = {
//     name: ''
//   };

//   handleChange = e => {
//     this.setState({
//       name: e.nativeEvent.text
//     });
//   };
//   handleSubmit = () => {
//     addItem(this.state.name);
//     AlertIOS.alert('Item saved successfully');
//   };

//   render() {
//     return (
//       <View style={styles.main}>
//         <Text style={styles.title}>Add Item</Text>
//         <TextInput style={styles.itemInput} onChange={this.handleChange} />
//         <TouchableHighlight
//           style={styles.button}
//           underlayColor="white"
//           onPress={this.handleSubmit}
//         >
//           <Text style={styles.buttonText}>Add</Text>
//         </TouchableHighlight>
//       </View>
//     );
//   }
// }

const styles = StyleSheet.create({
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
  boldTextCentered: {
    fontSize: 18,
    fontWeight: "600",
    padding: 15
  },
  button: {
    width: 160
  },
  fixToText: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 10
  },
  ratingText: {
    fontSize: 18,
    color: 'grey'
  }
});
