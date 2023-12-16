import React, {useRef, useEffect, useState} from 'react';
import Mapbox, {
  snapshotManager,
  Camera,
  UserLocation,
  offlineManager
} from '@rnmapbox/maps';
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  Dimensions,
  Button,
  ScrollView
} from 'react-native';
import Animated, {
  useSharedValue,
  withSpring,
  withTiming,
  useAnimatedStyle,
  BounceIn
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import geoViewport from '@mapbox/geo-viewport';
import Pack from './Pack';

const STYLE_URL = 'mapbox://styles/czarlypacza/clp2ub6sr00d201qt40zw7kv2';

const OfflineManager = ({cameraCoords, mapRef}) => {
  const [packName, setPackName] = useState('pack-1');
  const [packNO, setPackNO] = useState(4);

  const [Packs, setPacks] = useState([]);
  const [packsSize, setPacksSize] = useState([]);

  function takeSnapshot({width, height}) {
    return new Promise(async (resolve, reject) => {
      try {
        const uri = await snapshotManager.takeSnap({
          centerCoordinate: cameraCoords,
          width,
          height,
          zoomLevel: 11,
          pitch: 30,
          heading: 20,
          styleURL: STYLE_URL,
          writeToDisk: true
        });
        resolve(uri);
      } catch (error) {
        reject(error);
      }
    });
  }

  const DownloadMapOffline = async () => {
    const {width, height} = Dimensions.get('window');

    const coordinateNE = await mapRef.current?.getCoordinateFromView([
      width,
      0
    ]);
    const coordinateSW = await mapRef.current?.getCoordinateFromView([
      0,
      height
    ]);

    console.log('coords: ', coordinateNE, coordinateSW);
    // const bounds: [number, number, number, number] = geoViewport.bounds(
    //   cameraCoords,
    //   11,
    //   [width, height],
    //   512
    // );
    const bounds: [number, number, number, number] = [
      coordinateNE[0],
      coordinateNE[1],
      coordinateSW[0],
      coordinateSW[1]
    ];

    await takeSnapshot({width, height}).then(uri => {
      console.log('uri', uri);

      setPackNO(packNO + 1);
      let pack = 'pack-' + packNO;
      console.log(pack);
      setPackName(pack);

      const date = new Date().toLocaleString();

      const options = {
        name: date,
        styleURL: STYLE_URL,
        bounds: [
          [bounds[0], bounds[1]],
          [bounds[2], bounds[3]]
        ] as [[number, number], [number, number]],
        minZoom: 10,
        maxZoom: 20,
        metadata: {
          uri: uri
        }
      };

      offlineManager.createPack(options, (region, status) =>
        console.log('=> progress callback region:', 'status: ', status)
      );
    });
  };

  const GetAllPacks = async () => {
    const packs = await offlineManager.getPacks();
    console.log('=> packs:', packs);
    let tempPacks = []; // temporary array to hold the packs

    packs.forEach(pack => {
      tempPacks.push(pack); // push the pack into the temporary array
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

    setPacks(tempPacks);
  };

  const RemoveAllPacks = async () => {
    await offlineManager.resetDatabase().then(() => {
      console.log('Reset DB done');
    });
  };

  const translateY = useSharedValue(1000);

  const handlePress = () => {
    translateY.value -= 1000;
    GetAllPacks();
  };

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{translateY: withTiming(translateY.value * 2, {duration: 800})}]
  }));

  const closeModal = () => {
    translateY.value = withTiming(1000);
  };

  useEffect(() => {
    GetAllPacks();
  }, []);

  return (
    <>
      <Pressable style={styles.buttonDld} onPress={DownloadMapOffline}>
        <Icon name="download-for-offline" size={35} color="#FFF" />
      </Pressable>
      <Pressable style={styles.buttonModal} onPress={handlePress}>
        <Icon name="menu" size={35} color="#FFF" />
      </Pressable>
      <Animated.View
        // eslint-disable-next-line react-native/no-inline-styles
        style={[styles.modal, animatedStyles]}>
        <Pressable style={styles.closeModal} onPress={closeModal}>
          <Icon name="close" size={20} color="#FFF" />
        </Pressable>
        <View style={styles.buttons}>
          <Pressable style={styles.getPacks} onPress={GetAllPacks}>
            <Icon name="refresh" size={35} color="#FFF" />
          </Pressable>
          <Pressable style={styles.getPacks} onPress={RemoveAllPacks}>
            <Icon name="delete" size={35} color="#FFF" />
          </Pressable>
        </View>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.container}>
          {Packs.map(pack => (
            // <Text style={styles.text} key={pack.metadata.name}>
            //   {JSON.stringify(pack.metadata)}
            // </Text>
            <Pack
              Pack={pack}
              uri={pack.metadata.uri}
              key={pack.metadata.name}
              GetAllPacks={GetAllPacks}></Pack>
          ))}
        </ScrollView>
      </Animated.View>
    </>
  );
};

export default OfflineManager;

const styles = StyleSheet.create({
  scroll: {
    width: '100%',
    marginTop: 20
  },
  modal: {
    width: '100%',
    height: '90%',
    backgroundColor: '#3F4141',
    zIndex: 10,
    position: 'absolute',
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  buttons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: -20
  },
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  text: {
    color: '#333'
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
    justifyContent: 'center'
  },
  buttonDld: {
    position: 'absolute',
    top: '16%',
    right: 0,
    height: 50,
    width: 50,
    borderWidth: 1,
    borderRadius: 50,
    borderColor: 'rgba(47, 79, 79,0.4)',
    backgroundColor: 'rgba(47, 79, 79,0.88)',
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center'
  },
  buttonModal: {
    position: 'absolute',
    top: '24%',
    right: 0,
    height: 50,
    width: 50,
    borderWidth: 1,
    borderRadius: 50,
    borderColor: 'rgba(47, 79, 79,0.4)',
    backgroundColor: 'rgba(47, 79, 79,0.88)',
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center'
  },
  closeModal: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: 50,
    width: 50,
    borderWidth: 1,
    borderRadius: 50,
    borderColor: 'rgba(47, 79, 79,0.4)',
    backgroundColor: 'rgba(47, 79, 79,0.88)',
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center'
  },
  getPacks: {
    position: 'relative',
    height: 'auto',
    width: 100,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: 'rgba(47, 79, 79,0.4)',
    backgroundColor: 'rgba(47, 79, 79,0.88)',
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    marginTop: 20
  },
  buttonbg: {
    flex: 1
  },
  buttontx: {
    fontSize: 10,
    color: 'white', // Set the text color to black
    textAlign: 'center'
  }
});
