import React, { createContext, useState, useContext } from 'react';

interface LoginPopupContextType {
  isLoginPopupOpen: boolean;
  openLoginPopup: () => void;
  closeLoginPopup: () => void;
}

const LoginPopupContext = createContext<LoginPopupContextType | undefined>(undefined);

export const LoginPopupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState<boolean>(false);

  const openLoginPopup = () => {
    setIsLoginPopupOpen(true);
  };

  const closeLoginPopup = () => {
    setIsLoginPopupOpen(false);
  };

  const value = {
    isLoginPopupOpen,
    openLoginPopup,
    closeLoginPopup,
  };

  return <LoginPopupContext.Provider value={value}>{children}</LoginPopupContext.Provider>;
};

export const useLoginPopup = (): LoginPopupContextType => {
  const context = useContext(LoginPopupContext);
  if (context === undefined) {
    throw new Error('useLoginPopup must be used within a LoginPopupProvider');
  }
  return context;
};
