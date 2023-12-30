import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {barometer} from 'react-native-sensors';

import Geolocation from 'react-native-geolocation-service';
import Icon from 'react-native-vector-icons/MaterialIcons';

const API_KEY = process.env.REACT_APP_API_KEY;

export default function Altitude({PressureMemory, setPressureMemory}) {
  const [height, setHeight] = React.useState(0);
  const [pressureSea, setPressureSea] = useState(PressureMemory);
  const [gpsPosition, setGpsPosition] = useState([0, 0]);

  const [isCalibrated, setIsCalibrated] = useState(
    PressureMemory === 1018.37 ? false : true
  );

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          setGpsPosition([position.coords.latitude, position.coords.longitude]);
          resolve(position);
        },
        error => {
          console.log(error.code, error.message);
          reject(error);
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000}
      );
    });
  };

  const getPressureAPIData = (lat, lon) => {
    return fetch(
      'http://api.openweathermap.org/data/2.5/weather?lat=' +
        lat +
        '&lon=' +
        lon +
        '&appid='+API_KEY
    )
      .then(response => response.json())
      .then(data => {
        setPressureSea(!data.main.pressure ? 1018.37 : data.main.pressure);
        console.log(data);
        setPressureMemory(!data.main.pressure ? 1018.37 : data.main.pressure);
        setIsCalibrated(true);
      });
  };

  async function updateHeight() {
    try {
      const location = await getCurrentLocation();
      console.log(location);
      console.log('--------------------------------------------');

      const pressureData = await getPressureAPIData(
        location.coords.latitude,
        location.coords.longitude
      );
    } catch (error) {
      console.error(error);
    }
  }

  function calculateHeight(p: number, pATsea: number): number {
    //const pressureAtSeaLevel = pressure; //TODO:Ta wartosc jest zmienna wiecv trzeba znalesc api ktore ziera to z internetu
    const LapseRate = -0.0065;
    const temperatureAtSeaLevel = 288.15;
    const gravity = 9.80665;
    const molarMass = 0.0289644;
    const universalGasConstant = 8.31447;

    const pressureRatio = Math.pow(
      p / pATsea,
      (LapseRate * universalGasConstant) / (gravity * molarMass)
    );

    return (temperatureAtSeaLevel / LapseRate) * (1 - pressureRatio);
  }

  useEffect(() => {
    console.log('pressure memory:' + PressureMemory);
    const subscription = barometer.subscribe(({pressure}) => {
      setHeight(calculateHeight(pressure, pressureSea));
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [pressureSea]);

  return (
    <Pressable style={Altitudestyles.heightView} onPress={updateHeight}>
      <Text style={Altitudestyles.heightText}>{height.toFixed(0)}</Text>
      <Text style={Altitudestyles.metersText}>m.n.p.m</Text>
      {!isCalibrated && (
        <Icon
          style={Altitudestyles.icon}
          name="sync-problem"
          size={20}
          color="#D53232"
        />
      )}
    </Pressable>
  );
}

const Altitudestyles = StyleSheet.create({
  icon: {
    position: 'absolute',
    top: 0,
    right: 0
  },
  heightView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    width: 60,
    borderWidth: 2,
    borderBottomRightRadius: 30,
    backgroundColor: '#2F4F4F', // Set a background color that contrasts with the text color
    borderColor: 'rgba(47, 79, 79,0.4)',
    borderStartWidth: 0,
    borderTopWidth: 0
  },
  heightText: {
    fontSize: 20,
    color: 'white', // Set the text color to white
    alignSelf: 'center',
    marginTop: 'auto',
    marginBottom: '0',
    fontWeight: 'bold'
  },
  metersText: {
    fontSize: 10,
    color: 'white', // Set the text color to white
    alignSelf: 'center',
    marginTop: '0',
    marginBottom: 'auto',
    fontWeight: 'bold'
  }
});
