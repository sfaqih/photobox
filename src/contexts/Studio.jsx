import React, { createContext, useContext, useState } from 'react';
import { SessionTime } from '../constants/auth';

// Membuat Context
const Photobox = createContext();

// Provider Component
export const PhotoboxProvider = ({ children }) => {
  const [PhotoboxSession, setPhotoboxSession] = useState({
    frames: [],
    dirPath: null,
    printDirPath: null
  });

  const [loginSession, setLoginSession] = useState({
    isLogin: false,
    userId: null,
    sessionTime: SessionTime
  });

  const [settings, setSettings] = useState({});

  return (
    <Photobox.Provider value={{ PhotoboxSession, setPhotoboxSession, loginSession, setLoginSession, settings, setSettings }}>
      {children}
    </Photobox.Provider>
  );
};

// Hook untuk menggunakan context
export const usePhotobox = () => useContext(Photobox);