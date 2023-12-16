import React, {useRef, useEffect, useState} from 'react';
import Mapbox, {
  MapView,
  Camera,
  UserLocation,
  offlineManager
} from '@rnmapbox/maps';
import {
  View,
  StyleSheet,
  Image,
  Pressable,
  Text,
  Dimensions,
  Button,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const STYLE_URL = 'mapbox://styles/czarlypacza/clp2ub6sr00d201qt40zw7kv2';

const Pack = ({Pack, uri, GetAllPacks}) => {
  const [PackL, setPackL] = useState(Pack);

  useEffect(() => {
    console.log('PackL', PackL);
  }, [PackL]);

  const getPack = async ({packName}) => {
    const pack = await offlineManager.getPack(packName);
    if (pack) {
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

      console.log('=> status', await pack?.status());
      const packstatus = await pack?.status();
      let PackLcopy = JSON.parse(JSON.stringify(PackL));
      PackLcopy._metadata.name = pack.metadata.name;
      PackLcopy.pack.completedResourceSize = packstatus.completedResourceSize;
      PackLcopy.pack.percentage = packstatus.percentage;
      PackLcopy.pack.state = packstatus.state;
      console.log('=> PackLcopy', PackLcopy);
      setPackL(PackLcopy);
      console.log('=> PackL', PackL);
      console.log('=> Pack-name', PackL._metadata.name);
    }
  };

  const RemovePack = async ({packName}) => {
    const result = await offlineManager.deletePack(packName);
    GetAllPacks();
    console.log('Pack deleted', result);
  };

  const syncPack = async ({packName}) => {
    const result = await offlineManager.invalidatePack(packName);
    GetAllPacks();
    console.log('Pack synced', result);
  };


  return (
    <View style={styles.main}>
      <View style={styles.container}>
        <View style={styles.imagecontainer}>
          <Image
            resizeMode="cover"
            style={styles.image}
            source={{
              uri: uri
            }}
          />
        </View>
        <View style={styles.infocontainer}>
          <Text style={styles.text}>{PackL._metadata.name}</Text>
          <Text style={styles.text}>
            Size:{' '}
            {(PackL.pack.completedResourceSize / 1024 / 1024 / 8).toFixed(2) +
              ' MB'}
          </Text>
          <Text style={styles.text}>
            Downloaded: {PackL.pack.percentage + '%'}
          </Text>
          <Text style={styles.text}>Expires: {PackL.pack.expires}</Text>
          <Text style={styles.text}>State: {PackL.pack.state}</Text>
          <Pressable
            style={styles.getPacks}
            onPress={() => getPack({packName: PackL._metadata.name})}>
            <Icon name="refresh" size={35} color="#FFF" />
          </Pressable>
        </View>
      </View>
      <View style={styles.buttons}>
        <Pressable
          style={styles.deletePacks}
          onPress={() => RemovePack({packName: PackL._metadata.name})}>
          <Icon name="delete" size={35} color="#FFF" />
        </Pressable>
        {/* <Pressable
          style={styles.deletePacks}
          onPress={() => syncPack({packName: PackL._metadata.name})}>
          <Icon name="sync" size={35} color="#FFF" />
        </Pressable> */}
      </View>
    </View>
  );
};

export default Pack;

const styles = StyleSheet.create({
  buttons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: -20
  },
  deletePacks: {},
  getPacks: {
    position: 'absolute',
    top: 2,
    right: 2
  },
  infocontainer: {
    flex: 1,
    padding: 8,
    gap: 5
  },
  imagecontainer: {
    margin: 8,
    height: 120,
    aspectRatio: 9 / 18,
    borderRadius: 5,
    overflow: 'hidden'
  },
  image: {
    height: '100%',
    width: '100%'
  },
  container: {
    display: 'flex',
    flexDirection: 'row'
  },
  main:{
    position: 'relative',
    marginVertical: 20,
    height: 200,
    width: '95%',
    backgroundColor: '#333',
    overflow: 'hidden',
    borderRadius: 10,
  },
  text: {
    color: 'white'
  }
});
