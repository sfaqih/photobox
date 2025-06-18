import React, { createContext, useContext, useState } from 'react';
import { SessionTime } from '../constants/auth';

// Membuat Context
const Photobox = createContext();

// Provider Component
export const PhotoboxProvider = ({ children }) => {
  const [photoboxSession, setPhotoboxSession] = useState({
    frames: [],
    dirPath: null,
    printDirPath: null
  });

  const [loginSession, setLoginSession] = useState({
    isLogin: false,
    userId: null,
    sessionTime: SessionTime
  });

  const [photoSession, setPhotoSession] = useState({
    amount: 0,
    orderId: null,
    paymentToken: null,
    paymentChannel: null,
    printCopies: 0
  });

  const [settings, setSettings] = useState({
    landingImage: '',
    backgroundImage: '',
    preSession: 2,
    session: 5,
    basePrice: 25000,
    printPrice: 5000
  });

  return (
    <Photobox.Provider value={{ photoboxSession, setPhotoboxSession, loginSession, setLoginSession, settings, setSettings, photoSession, setPhotoSession }}>
      {children}
    </Photobox.Provider>
  );
};

// Hook untuk menggunakan context
export const usePhotobox = () => useContext(Photobox);