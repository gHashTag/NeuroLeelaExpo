import React, { createContext, useContext, useState } from "react";

type RegistrationData = {
  username: string;
  photo_url: string;
  designation: string;
};

type RegistrationContextType = {
  registrationData: RegistrationData;
  setUsername: (username: string) => void;
  setPhotoUrl: (url: string) => void;
  setDesignation: (designation: string) => void;
};

const defaultRegistrationData: RegistrationData = {
  username: "",
  photo_url: "",
  designation: "",
};

export const RegistrationContext = createContext<RegistrationContextType>({
  registrationData: defaultRegistrationData,
  setUsername: () => {},
  setPhotoUrl: () => {},
  setDesignation: () => {},
});

export const useRegistration = () => useContext(RegistrationContext);

export const RegistrationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [registrationData, setRegistrationData] =
    useState<RegistrationData>(defaultRegistrationData);

  const setUsername = (username: string) => {
    setRegistrationData((prev) => ({ ...prev, username }));
  };

  const setPhotoUrl = (photo_url: string) => {
    setRegistrationData((prev) => ({ ...prev, photo_url }));
  };

  const setDesignation = (designation: string) => {
    setRegistrationData((prev) => ({ ...prev, designation }));
  };

  return (
    <RegistrationContext.Provider
      value={{
        registrationData,
        setUsername,
        setPhotoUrl,
        setDesignation,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
};
