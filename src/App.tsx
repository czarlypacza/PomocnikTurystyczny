import React, {useEffect, useState} from 'react';
import {PermissionsAndroid, StyleSheet, View, Text, Button} from 'react-native';
import Mapbox from '@rnmapbox/maps';

import Altitude from './Alt/Altitude';
import Map from './Map/Map';
import StepCounter from './Step/StepCounter';

Mapbox.setAccessToken(
  'pk.eyJ1IjoiY3phcmx5cGFjemEiLCJhIjoiY2xvOHJrbHA1MDR4dTJqbG01ZDA3ZHloNiJ9.aTEnlaUtpzs7S10k1Pmbgw'
);

const requestLocationPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Geolocation Permission',
        message: 'Can we access your location?',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK'
      }
    );
    console.log('granted', granted);
    if (granted === 'granted') {
      console.log('You can use Geolocation');
      return true;
    } else {
      console.log('You cannot use Geolocation');
      return false;
    }
  } catch (err) {
    return false;
  }
};

const App = () => {
  

  const UserLocationRef = React.useRef<Mapbox.UserLocation>(null);

  const [isLocationPermissionGranted, setLocationPermissionGranted] =
    useState(false);

  useEffect(() => {
    requestLocationPermission().then(result => {
      setLocationPermissionGranted(result);

      // if (result) {
      //   isLocationEnabled().then(enabled => {
      //     if (!enabled) {
      //       console.log('not enabled');
      //       promptForEnableLocationIfNeeded().then(result => {
      //         setLocation(result === 'enabled' ? true : false);
      //       });
      //     } else {
      //       setLocation(true);
      //     }
      //   });
      //}
    });
  }, []);

  return !isLocationPermissionGranted ? (
    <View style={styles.page}>
      <View style={styles.container}>
        <Text>To use the app you myst enable location access</Text>
        <Button title={'grant access'}></Button>
      </View>
    </View>
  ) : (
    <View style={styles.page}>
      <View style={styles.container}>
        <Map UserLocationRef={UserLocationRef} />
        <Altitude />
        <StepCounter />
      </View>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    height: '100%',
    width: '100%'
  },
  stepCouner: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    height: 60,
    width: 60,
    borderWidth: 2,
    borderRadius: 50,
    backgroundColor: 'black' // Set a background color that contrasts with the text color
  }
});
