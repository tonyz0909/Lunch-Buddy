import React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import MainTabNavigator from './MainTabNavigator';
import LoginScreen from '../screens/LoginScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LinksScreen from '../screens/LinksScreen';
import HomeScreen from '../screens/HomeScreen';

export default createAppContainer(
  createSwitchNavigator({
    // You could add another route here for authentication.
    // Read more at https://reactnavigation.org/docs/en/auth-flow.html
    Main: MainTabNavigator,
    Login: LoginScreen,
    Home: HomeScreen,
    Links: LinksScreen,
    Settings: SettingsScreen,
  },
  {
    initialRouteName: 'Login',
  })
);
