import React, { Component } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Input, ListItem, Text } from 'react-native-elements';
import { ExpoLinksView } from '@expo/samples';
import { firebaseapp as fbase} from '../src/config';
import API from '../api.json';
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

let addItem = item => {
  db.ref('/items').push({
    name: item
  });
}

export default class LinksScreen extends Component {
  getRequest = () => {
    var user = fbase.auth().currentUser; 
    var db = fbase.firestore();
    var profileRef = db.collection("requests").doc(user.uid);
    profileRef.get().then(doc => {
      if (doc.exists) {
        console.log("Document data:", doc.data());
        this.setState({
          location: doc.data().placeID.toString(),
          start: doc.data().startTime.toString(),
          end: doc.data().endTime.toString(),
          matched: doc.data().matched,
          match: doc.data().matchID,
          edits: {
            location: "Chipotle Mexican Grill, 540 17th St NW #420, Atlanta, GA 30318",
            start: "11:30am",
            end: "1:30pm",
          }
        });
    } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
    }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
  }

  getFlake = () => {
    var user = fbase.auth().currentUser;
    var db = fbase.firestore();
    var profileRef = db.collection("users").doc(user.uid);
    profileRef.get().then(doc => {
      if (doc.exists) {
        console.log("Document data:", doc.data().flakeToday.toString());
        this.setState({
          flakeToday: doc.data().flakeToday.toString()
        });
      }
    });
  }
  setFlake = () => {
    var user = fbase.auth().currentUser;
    var db = fbase.firestore();
    var profileRef = db.collection("users").doc(user.uid);
    profileRef.set({
      flakeToday: true
    });
    Alert.alert('You flaker :(');
    db.collection("requests").doc(user.uid).delete().then(function() {
      console.log("Document successfully deleted!");
    }).catch(function(error) {
      console.error("Error removing document: ", error);
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
      titleText: 'Your Request',
      view: 'view',
      location: '',
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
    this.getRequest();
    this.getFlake = this.getRequest.bind(this);
    this.getFlake();
  }

  flake = () => {
    Alert.alert('You flaker :(');
    this.setState({
      location: null
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
                  <View style={styles.fixToText}>
                    <Button title="Edit" buttonStyle={styles.button} raised={true} onPress={() => this.setState({ view: "edit" })} />
                    <Button title="Flake" buttonStyle={styles.button} raised={true} onPress={this.setFlake} />
                  </View>
                </View>
              }
              {this.state.view === 'edit' &&
                <View>
                  <ListItem
                    key={0}
                    title={<Text style={styles.boldText}>{"Location:"}</Text>}
                    subtitle={<Input
                      placeholder={this.state.location}
                      onChangeText={text => this.setState({ edits: { ...this.state.edits, location: text } })} />}
                    bottomDivider
                  />
                  <ListItem
                    key={1}
                    title={<Text style={styles.boldText}>{"Lunch start time:"}</Text>}
                    subtitle={<Input
                      placeholder={this.state.start}
                      onChangeText={text => this.setState({ edits: { ...this.state.edits, start: text } })} />}
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
            <View>
              < Text style={styles.boldText} >
                {"No lunch plan today :("}
              </Text >
              <Button title="Create request" buttonStyle={styles.button} raised={true} onPress={this.flake} />
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
  main: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#ffffff',
    padding: 10
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
  ratingText: {
    fontSize: 18,
    color: 'grey'
  }
});
