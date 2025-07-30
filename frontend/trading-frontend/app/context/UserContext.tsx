import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of your user
type User = {
  userId: number;
  username: string;
} | null;

// Define the context type
type UserContextType = {
  user: User;
  setUser: (user: User) => void;
};

// Create the context with default undefined
const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use context safely
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export { UserContext };