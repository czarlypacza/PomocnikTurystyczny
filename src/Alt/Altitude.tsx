import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {barometer} from 'react-native-sensors';

import Geolocation from 'react-native-geolocation-service';

export default function Altitude({UserLocationRef}) {
  const [height, setHeight] = React.useState(0);
  const [pressure, setPressure] = useState(1018.37);
  const [gpsPosition, setGpsPosition] = useState([0, 0]);

  const getPressureAPIData = (lat, lon) => {
    fetch(
      'http://api.openweathermap.org/data/2.5/weather?lat=' +
        lat +
        '&lon=' +
        lon + // TODO: uzyj oddzielnej golokacji niz tej z mapbox
        '&appid=5886f8a39f021f7f8afff63952d42044'
    ).then(response =>
      response.json().then(data => {
        setPressure(!data.main.sea_level ? 1018.37 : data.main.sea_level);
      })
    );
  };

  const updateHeight = () => {
    getPressureAPIData(gpsPosition[0], gpsPosition[1]);
    console.log(pressure);
  };

  const calculateHeight = (p: number): number => {
    const pressureAtSeaLevel = pressure; //TODO:Ta wartosc jest zmienna wiecv trzeba znalesc api ktore ziera to z internetu
    const LapseRate = -0.0065;
    const temperatureAtSeaLevel = 288.15;
    const gravity = 9.80665;
    const molarMass = 0.0289644;
    const universalGasConstant = 8.31447;

    const pressureRatio = Math.pow(
      p / pressureAtSeaLevel,
      (LapseRate * universalGasConstant) / (gravity * molarMass)
    );

    return (temperatureAtSeaLevel / LapseRate) * (1 - pressureRatio);
  };

  useEffect(() => {
    const subscription = barometer.subscribe(({pressure}) => {
      Geolocation.getCurrentPosition(
        position => {
          setGpsPosition([position.coords.latitude, position.coords.longitude]);
          //console.log(position);
        },
        error => {
          // See error code charts below.
          console.log(error.code, error.message);
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000}
      );
      //getPressureAPIData(gpsPosition[0], gpsPosition[1]);

      setHeight(calculateHeight(pressure));
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Pressable style={Altitudestyles.heightView} onPress={updateHeight}>
      <Text style={Altitudestyles.heightText}>{height.toFixed(0)}</Text>
    </Pressable>
  );
}

const Altitudestyles = StyleSheet.create({
  heightView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    width: 60,
    borderWidth: 2,
    borderRadius: 50,
    backgroundColor: '#353' // Set a background color that contrasts with the text color
  },
  heightText: {
    fontSize: 20,
    color: 'white', // Set the text color to white
    alignSelf: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
    fontWeight: 'bold'
  }
});
