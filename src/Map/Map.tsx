import geoViewport from '@mapbox/geo-viewport';
import React, {useRef, useEffect, useState} from 'react';
import Mapbox, {Camera, UserLocation, offlineManager} from '@rnmapbox/maps';
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  Dimensions,
  Button
} from 'react-native';
import {
  promptForEnableLocationIfNeeded,
  isLocationEnabled
} from 'react-native-android-location-enabler';

const STYLE_URL = 'mapbox://styles/czarlypacza/clp2ub6sr00d201qt40zw7kv2';

const Map = ({UserLocationRef}) => {
  const coordinatesUR: [number, number] = [
    22.01453964870298, 50.02980135312927
  ];
  const [camera, setCamera] = useState(coordinatesUR);

  const [cameraCoords, setcameraCoords] = useState(coordinatesUR);

  const [isLocation, setLocation] = useState(false);
  const [packName, setPackName] = useState('pack-1');
  const [packNO, setPackNO] = useState(1);

  const cameraRef = React.useRef<Mapbox.Camera>(null);

  const goback = () => {
    if (UserLocationRef.current?.state.coordinates == null) {
      console.log('aaa');
    }
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

  const DownloadMapOffline = () => {
    const {width, height} = Dimensions.get('window');
    const bounds: [number, number, number, number] = geoViewport.bounds(
      cameraCoords,
      15,
      [width, height],
      512
    );

    setPackNO(packNO + 1);
    let pack = 'pack-' + packNO;
    console.log(pack);
    setPackName(pack);

    const options = {
      name: packName,
      styleURL: STYLE_URL,
      bounds: [
        [bounds[0], bounds[1]],
        [bounds[2], bounds[3]]
      ] as [[number, number], [number, number]],
      minZoom: 10,
      maxZoom: 20,
      metadata: {
        whatIsThat: 'foo'
      }
    };
    offlineManager.createPack(options, (region, status) =>
      console.log('=> progress callback region:', 'status: ', status)
    );
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
        onCameraChanged={onCameraChanged}>
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
      {(isLocation && (
        <Pressable style={styles.button} onPress={goback}>
          <View style={styles.buttonbg}>
            <Text style={styles.buttontx}>
              {UserLocationRef.current?.state.coordinates?.[0]}.{'\n'}
              {UserLocationRef.current?.state.coordinates?.[1]}.{'\n'}
              {'go back'}
            </Text>
          </View>
        </Pressable>
      )) || (
        <Pressable style={styles.button} onPress={handleEnabledPressed}>
          <View style={styles.buttonbg}>
            <Text style={styles.buttontx}>Enable location</Text>
          </View>
        </Pressable>
      )}
      <Pressable style={styles.buttonOffline} onPress={DownloadMapOffline}>
        <Text style={styles.buttontx}>offline</Text>
      </Pressable>

      <Button
        title="Get all packs"
        onPress={async () => {
          const packs = await offlineManager.getPacks();
          console.log('=> packs:', packs);
          packs.forEach(pack => {
            console.log(
              'pack:',
              pack,
              'name:',
              pack.name,
              'bounds:',
              pack?.bounds,
              'metadata',
              pack?.metadata
            );
          });
        }}
      />
      <Pressable
        style={styles.buttonRM}
        onPress={async () => {
          await offlineManager.resetDatabase().then(() => {
            console.log('Reset DB done');
          });
        }}
      />
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
  buttonOffline: {
    position: 'absolute',
    top: '8%',
    right: 0,
    height: 50,
    width: 50,
    borderWidth: 1,
    borderRadius: 50,
    backgroundColor: '#353',
    alignItems: 'center',
    padding: 'auto'
  },
  buttonRM: {
    position: 'absolute',
    top: '16%',
    right: 0,
    height: 50,
    width: 50,
    borderWidth: 1,
    borderRadius: 50,
    backgroundColor: '#353',
    alignItems: 'center',
    padding: 'auto'
  },
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
    right: 0,
    height: 50,
    width: 100,
    borderWidth: 1,
    borderRadius: 50,
    overflow: 'hidden',
    alignItems: 'center',
    backgroundColor: '#353' // Set a background color that contrasts with the text color
  },
  buttonbg: {
    flex: 1
  },
  buttontx: {
    fontSize: 10,
    color: 'white' // Set the text color to black
  }
});
