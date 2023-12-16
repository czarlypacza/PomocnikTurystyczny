import React, {useRef, useEffect, useState} from 'react';
import Mapbox, {Camera, UserLocation} from '@rnmapbox/maps';
import {View, StyleSheet, Pressable, Text, Dimensions} from 'react-native';
import {
  promptForEnableLocationIfNeeded,
  isLocationEnabled
} from 'react-native-android-location-enabler';
import OfflineManager from './OfflineManager';
import Icon from 'react-native-vector-icons/MaterialIcons';

const STYLE_URL = 'mapbox://styles/czarlypacza/clp2ub6sr00d201qt40zw7kv2';

const Map = ({UserLocationRef, isOffline, setisOffline}) => {
  const coordinatesUR: [number, number] = [
    22.01453964870298, 50.02980135312927
  ];
  const [camera, setCamera] = useState(coordinatesUR);

  const [cameraCoords, setcameraCoords] = useState(coordinatesUR);

  const [isLocation, setLocation] = useState(false);

  const cameraRef = React.useRef<Mapbox.Camera>(null);
  const mapRef = React.useRef<Mapbox.MapView>(null);
  const [zoom, setZoom] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(14);

  const goback = () => {
    if (UserLocationRef.current?.state.coordinates == null) {
      console.log('aaa');
    }
    isOffline ? setZoomLevel(12) : setZoomLevel(14);
    setCamera(UserLocationRef.current?.state.coordinates);
    // cameraRef.current?.setCamera({
    //   centerCoordinate: camera,
    //   zoomLevel: 14
    // });
  };

  useEffect(() => {
    isLocationEnabled().then(result => {
      setLocation(result);
    });
  }, []);

  async function waitForCoordinates() {
    return new Promise(resolve => {
      const interval = setInterval(() => {
        if (UserLocationRef.current?.state.coordinates != null) {
          clearInterval(interval);
          resolve(UserLocationRef.current?.state.coordinates);
        }
      }, 100);
    });
  }
  //coords:  [22.0138413337464, 49.69536358573768]
  //Camera: 22.01366683418948,49.695234034412074
  async function handleEnabledPressed() {
    try {
      const enableResult = await promptForEnableLocationIfNeeded();
      console.log('enableResult', enableResult);
      setLocation(true);
      waitForCoordinates().then(() => {
        goback();
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      }
    }
  }

  const onCameraChanged = regionFeature => {
    //console.log(regionFeature.properties.center);
    setcameraCoords(regionFeature.properties.center);
    console.log('Camera: ' + cameraCoords);
  };

  const changeIsOffline = () => {
    setisOffline(!isOffline);
    setZoom(!zoom);
    // !isOffline
    //   ? cameraRef.current?.setCamera({
    //       zoomLevel: 12
    //     })
    //   : cameraRef.current?.setCamera({
    //       zoomLevel: 14
    //     });
    !isOffline ? setZoomLevel(12) : setZoomLevel(14);
  };

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        style={styles.map}
        projection="globe"
        styleURL={STYLE_URL}
        logoEnabled={false}
        compassEnabled={true}
        scaleBarEnabled={false}
        zoomEnabled={zoom}
        onCameraChanged={onCameraChanged}
        ref={mapRef}>
        <Mapbox.Camera
          ref={cameraRef}
          zoomLevel={zoomLevel}
          centerCoordinate={camera}
        />
        <UserLocation ref={UserLocationRef} minDisplacement={0.5} />
        <Mapbox.PointAnnotation key="UR" id="UR" coordinate={coordinatesUR}>
          <View style={styles.point} />
          <Mapbox.Callout title="Witaj na UR" contentStyle={styles.callout} />
        </Mapbox.PointAnnotation>
      </Mapbox.MapView>
      {(isLocation && (
        <Pressable style={styles.button} onPress={goback}>
          <View style={styles.buttonbg}>
            {/* <Text style={styles.buttontx}>
              {UserLocationRef.current?.state.coordinates?.[0]}.{'\n'}
              {UserLocationRef.current?.state.coordinates?.[1]}.{'\n'}
              {'go back'}
            </Text> */}
            <Icon name="radio-button-checked" size={30} color="#FFF" />
          </View>
        </Pressable>
      )) || (
        <Pressable style={styles.button} onPress={handleEnabledPressed}>
          <View style={styles.buttonbg}>
            {/* <Text style={styles.buttontx}>Enable location</Text> */}
            <Icon name="radio-button-unchecked" size={30} color="#FFF" />
          </View>
        </Pressable>
      )}
      <Pressable style={styles.buttonOffline} onPress={changeIsOffline}>
        {/* <Text style={styles.buttontx}>{!isOffline ? 'offline' : 'back'}</Text> */}
        {!isOffline ? (
          <Icon name="download" size={30} color="#FFF" />
        ) : (
          <Icon name="arrow-back" size={30} color="#FFF" />
        )}
      </Pressable>
      <View style={styles.indicator}></View>
      {isOffline && (
        <OfflineManager cameraCoords={cameraCoords} mapRef={mapRef} />
      )}
    </View>
  );
};

export default Map;

const styles = StyleSheet.create({
  indicator: {
    position: 'absolute',
    top: 100,
    right: 0,
    height: 10,
    width: 10,
    borderRadius: 50,
    backgroundColor: 'red',
    display: 'none'
  },
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
  buttonOffline: {
    position: 'absolute',
    top: '8%',
    right: 0,
    height: 50,
    width: 50,
    borderWidth: 1,
    borderRadius: 50,
    borderColor: 'rgba(47, 79, 79,0.4)',
    backgroundColor: 'rgba(47, 79, 79,0.88)',
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    padding: 'auto'
  },
  button: {
    position: 'absolute',
    bottom: '4%',
    right: '4%',
    height: 50,
    width: 50,
    borderWidth: 1,
    borderColor: 'rgba(47, 79, 79,0.4)',
    borderRadius: 50,
    overflow: 'hidden',
    alignItems: 'center',
    display: 'flex',
    backgroundColor: 'rgba(47, 79, 79,0.88)' // Set a background color that contrasts with the text color
  },
  buttonbg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttontx: {
    fontSize: 10,
    color: 'white', // Set the text color to black
    textAlign: 'center'
  }
});
