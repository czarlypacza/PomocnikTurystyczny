import React, {useRef, useEffect, useState} from 'react';
import Mapbox, {UserLocation} from '@rnmapbox/maps';
import {View, StyleSheet, Pressable, Text} from 'react-native';
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded
} from 'react-native-android-location-enabler';

const Map = ({UserLocationRef, cameraRef, isLocation}) => {
  const coordinatesUR = [22.01453964870298, 50.02980135312927];
  const [camera, setCamera] = useState(coordinatesUR);

  const goback = () => {
    isLocationEnabled().then(enabled => {
      if (!enabled) {
        promptForEnableLocationIfNeeded();
      } //Nie sprawdzone
    });

    if (UserLocationRef.current?.state.coordinates == null) {
      console.log('aaa');
    }
    //getCameraLocation();
    setCamera(UserLocationRef.current?.state.coordinates);
    cameraRef.current?.setCamera({
      centerCoordinate: camera,
      zoomLevel: 14
    });
  };

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        style={styles.map}
        projection="globe"
        styleURL="mapbox://styles/czarlypacza/clp2ub6sr00d201qt40zw7kv2"
        logoEnabled={false}
        compassEnabled={true}
        scaleBarEnabled={false}>
        <Mapbox.Camera
          ref={cameraRef}
          zoomLevel={14}
          centerCoordinate={camera}
        />
        <UserLocation ref={UserLocationRef} minDisplacement={0.5} />
        <Mapbox.PointAnnotation key="UR" id="UR" coordinate={coordinatesUR}>
          <View style={styles.point} />
          <Mapbox.Callout title="Witaj na UR" contentStyle={styles.callout} />
        </Mapbox.PointAnnotation>
      </Mapbox.MapView>
      {isLocation && (
        <Pressable style={styles.button} onPress={goback}>
          <View style={styles.buttonbg}>
            <Text style={styles.buttontx}>
              {UserLocationRef.current?.state.coordinates?.[0]}.{'\n'}
              {UserLocationRef.current?.state.coordinates?.[1]}.{'\n'}
              {'go back'}
            </Text>
          </View>
        </Pressable>
      )}
    </View>
  );
};

export default Map;

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%'
  },
  map: {
    flex: 1
  },
  point: {
    height: 20,
    width: 20,
    backgroundColor: 'blue',
    borderColor: 'white',
    borderWidth: 2,
    borderRadius: 60
  },
  callout: {
    borderRadius: 5
  },
  // button: {
  //   position: 'absolute',
  //   bottom: 0,
  //   left: 0,
  //   right: 0,
  //   height: 50,
  //   width: 50,
  //   borderWidth: 1,
  //   borderRadius: 50,
  // },
  // buttonbg: {
  //   flex: 1,
  //   backgroundColor: 'white',
  // },
  // buttontx: {
  //   fontSize: 20,
  //   color: 'black',
  // },
  button: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    width: 400,
    borderWidth: 1,
    borderRadius: 50,
    backgroundColor: 'white' // Set a background color that contrasts with the text color
  },
  buttonbg: {
    flex: 1,
    backgroundColor: 'white' // Set a background color that contrasts with the text color
  },
  buttontx: {
    fontSize: 10,
    color: 'black' // Set the text color to black
  }
});
