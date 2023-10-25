import { useState, createContext, useContext } from "react";
import type { User } from "~/types";

interface UserContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
}

const defaultUserContextValue: UserContextValue = {
  user: null,
  setUser: () => {},
};

const UserContext = createContext<UserContextValue>(defaultUserContextValue);

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider(props: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {props.children}
    </UserContext.Provider>
  );
}
