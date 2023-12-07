import React, {useEffect, useState} from 'react';
import {
  isStepCountingSupported,
  parseStepData,
  startStepCounterUpdate,
  stopStepCounterUpdate
} from '@dongminyu/react-native-step-counter';

export default function StepCounter(): JSX.Element {
  const [steps, setSteps] = useState(0);
  const [supported, setSupported] = useState(false);
  const [granted, setGranted] = useState(false);

  async function askPermission() {
    isStepCountingSupported().then(result => {
      console.debug('🚀 - isStepCountingSupported', result);
      setGranted(result.granted === true);
      setSupported(result.supported === true);
    });
  }

  async function startStepCounter() {
    startStepCounterUpdate(new Date(), data => {
      console.debug(parseStepData(data));
      setSteps(data.steps);
    });
  }

  useEffect(() => {
    askPermission();
    return () => {
      stopStepCounterUpdate();
    };
  }, []);

  useEffect(() => {
    startStepCounter();
  }, [granted, supported]);

  return <>{steps}</>;
}
