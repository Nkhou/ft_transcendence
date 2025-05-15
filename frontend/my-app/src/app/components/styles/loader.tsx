import React from 'react';

const Spinner = () => {
  return (
    <div className="fixed w-screen h-screen flex justify-center items-center bg-black">
      <div className="w-24 h-24 rounded-full animate-spinning bg-white shadow-spinnerGlow">
      </div>
    </div>
  );
};

export default Spinner;

