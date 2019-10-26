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
    this.setState({lunchStartDateTime:date}); 
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
    this.setState({lunchEndDateTime: date});
    this.hideDateTimePicker2();
  };

  handleLocationPicked = str => {
    this.setState({ locationPlaceID: str });
  }

  submit = () => {
    if (this.state.locationPlaceID == null || this.state.lunchStartDateTime == null || this.state.lunchEndDateTime == null) {
      Alert.alert("One or more fields are empty"); 
    } else {
      if (this.state.lunchStartDateTime > this.state.lunchEndDateTime) { 
        Alert.alert("End Time is before Start Time!");
      } else {
        let request = { 
          location: this.state.locationPlaceID,
          startTime: this.state.lunchStartDateTime,
          endTime: this.state.lunchEndDateTime,
        }
        console.log(request); 
        Alert.alert("Request Going Through"); //Just to not crash stuff 
      }
    }
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
              title={<Text style={styles.boldText}>{"Enter Location:"}</Text>}
              subtitle={
                  //TODO fix the double click 
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
                        console.log(data.place_id)
                        this.handleLocationPicked(data.place_id)
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
                  }
              bottomDivider
            />
          </View>


          <View style={styles.inputs}>
            <ListItem
              key={0}
              title={
                <View style= { styles.times }>
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


          <View style={styles.fixToText}>
            <Button title="Submit Request!" buttonStyle={styles.button} raised={true} onPress={this.submit} />
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
