import React, { Component } from 'react';
import { Alert, ScrollView, StyleSheet, View, StatusBar } from 'react-native';
import { Button, Icon, Input, ListItem, Text } from 'react-native-elements';
import { ExpoLinksView } from '@expo/samples';
import { firebaseapp as fbase} from '../src/config';
import API from '../api.json';
import { db } from '../src/config';
import DateTimePicker from "react-native-modal-datetime-picker";


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
    this.setState({ edits: {...this.state.edits, end: this.lunchendstring } })
    this.hideDateTimePicker2();
  };

  handleLocationPicked = str => {
    this.setState({ locationPlaceID: str });
  }

  getRequest = () => {
    var user = fbase.auth().currentUser; 
    var db = fbase.firestore();
    var profileRef = db.collection("requests").doc(user.uid);
    profileRef.get().then(doc => {
      if (doc.exists) {
        // console.log("Document data:", doc.data());
        // console.log("Start Time:", doc.data().startTime.toDate().toLocaleTimeString('en-US'))
        
        let url = 'https://maps.googleapis.com/maps/api/place/details/json?';
        let place_id = "place_id=" + doc.data().placeID.toString();
        let fields = "fields=name,formatted_address"
        let key = "key=" + API["googlemaps"]
        let requestReverseGeoCode = url + place_id + "&" + fields + "&" + key
        console.log(requestReverseGeoCode); 
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

        }))
        .catch(err => {
          console.log(err); 
        });

        


    } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
    }
    }).catch(function(error) {
        console.log("Error getting document:", error);
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
      
    };
    this.lunchstartstring = "" // TEST start date time string 
    this.lunchendstring = ""
    this.getRequest = this.getRequest.bind(this);
    this.getRequest();
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
          this.state.location ?
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
                    title={<Text style={styles.boldText}>{"Start Time:"}</Text>}
                    subtitle={<Text style={styles.ratingText}>{this.state.start}</Text>}
                    bottomDivider
                  />
                  <ListItem
                    key={2}
                    title={<Text style={styles.boldText}>{"End Time:"}</Text>}
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
                    <Button title="Flake" buttonStyle={styles.button} raised={true} onPress={this.flake} />
                  </View>
                </View>
              }

              {/* ON EDIT  */}
              {this.state.view === 'edit' &&
                <View>
                  {/* TODO LATER  */}
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
                  {/* render the pens  */}
                {/* <ListItem
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
                  /> */}
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
                    // subtitle={
                    //   <Input
                    //   placeholder={this.state.start}
                    //   onChangeText={text => this.setState({ edits: { ...this.state.edits, start: text } })} />
                    //   }
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
                    // subtitle={
                    //  <Input
                    //   placeholder={this.state.end}
                    //   onChangeText={text => this.setState({ edits: { ...this.state.edits, end: text } })} />
                    // }
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
  timeText:{
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
