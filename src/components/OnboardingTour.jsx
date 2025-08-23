
import React from 'react';
import Joyride, { STATUS } from 'react-joyride';

const OnboardingTour = ({ run, steps, handleJoyrideCallback }) => {
  return (
    <Joyride
      run={run}
      steps={steps}
      continuous
      showProgress
      showSkipButton
      handleJoyrideCallback={handleJoyrideCallback}
      styles={{
        options: {
          arrowColor: '#fff',
          backgroundColor: '#fff',
          primaryColor: '#007bff',
          textColor: '#333',
          width: 400,
          zIndex: 1000,
        },
      }}
    />
  );
};

export default OnboardingTour;
