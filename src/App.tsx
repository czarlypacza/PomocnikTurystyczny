import React, {useEffect, useState} from 'react';
import {PermissionsAndroid, StyleSheet, View, Text, Button} from 'react-native';
import Mapbox from '@rnmapbox/maps';

import Altitude from './Alt/Altitude';
import Map from './Map/Map';
import StepCounter from './Step/StepCounter';

const API_KEY = process.env.REACT_APP_API_KEY;

Mapbox.setAccessToken(API_KEY);

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

  const [OfflineManagerState, setOfflineManagerState] = useState(false);

  const [PressureMemory, setPressureMemory] = useState(1018.37);
  const [StepsMemory, setStepsMemory] = useState(0);

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
        <Map
          UserLocationRef={UserLocationRef}
          isOffline={OfflineManagerState}
          setisOffline={setOfflineManagerState}
        />
        {!OfflineManagerState && (
          <>
            <Altitude
              PressureMemory={PressureMemory}
              setPressureMemory={setPressureMemory}
            />
            <StepCounter
              StepsMemory={StepsMemory}
              setStepsmemory={setStepsMemory}
            />
          </>
        )}
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
    position: 'relative',
    bottom: 20,
    left: 0,
    height: 60,
    width: 60,
    borderWidth: 2,
    borderRadius: 50,
    zIndex: 10,
    backgroundColor: 'black' // Set a background color that contrasts with the text color
  }
});
