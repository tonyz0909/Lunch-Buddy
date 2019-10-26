import React, { Component } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Input, ListItem, Text } from 'react-native-elements';
import { ExpoLinksView } from '@expo/samples';

export default class LinksScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      titleText: "Your Requests",
      view: "view",
      location: "Chipotle Mexican Grill, 540 17th St NW #420, Atlanta, GA 30318",
      start: "11:30am",
      end: "1:30pm",
      edits: {
        location: "Chipotle Mexican Grill, 540 17th St NW #420, Atlanta, GA 30318",
        start: "11:30am",
        end: "1:30pm",
      }
    };
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
    padding: 10
  },
  baseText: {
    fontSize: 20,
  },
  boldText: {
    fontSize: 20,
    fontWeight: "bold"
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
    fontSize: 20,
    color: 'grey'
  }
});
