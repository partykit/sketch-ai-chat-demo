// Nests inside PresenceContext and handles cursor updates

import { useState, createContext, useContext, useEffect } from "react";
import type { Cursor, User } from "../../party/presence-schema";
import { usePresence } from "./presence-context";

interface CursorsContextType {
  otherUsers: Map<string, User>;
  myself: User | null;
}

export const CursorsContext = createContext<CursorsContextType>({
  otherUsers: {} as Map<string, User>,
  myself: null,
});

export function useCursors() {
  return useContext(CursorsContext);
}

export default function CursorsContextProvider(props: {
  children: React.ReactNode;
}) {
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });
  const { myself, otherUsers, updatePresence } = usePresence();

  // Track window dimensions
  useEffect(() => {
    const onResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", onResize);
    onResize();
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Always track the mouse position
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dimensions.width || !dimensions.height) return;
      const cursor = {
        x: e.clientX / dimensions.width,
        y: e.clientY / dimensions.height,
        pointer: "mouse",
      } as Cursor;
      updatePresence({ cursor });
    };
    window.addEventListener("mousemove", onMouseMove);

    // Also listen for touch events
    const onTouchMove = (e: TouchEvent) => {
      if (!dimensions.width || !dimensions.height) return;
      const cursor = {
        x: e.touches[0].clientX / dimensions.width,
        y: e.touches[0].clientY / dimensions.height,
        pointer: "touch",
      } as Cursor;
      updatePresence({ cursor });
    };
    window.addEventListener("touchmove", onTouchMove);

    // Catch the end of touch events
    const onTouchEnd = (e: TouchEvent) => {
      updatePresence({ cursor: null });
    };
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [dimensions]);

  const transformCursor = (user: User) => {
    const cursor = user.presence?.cursor
      ? {
          ...user.presence.cursor,
          x: user.presence.cursor.x * dimensions.width,
          y: user.presence.cursor.y * dimensions.height,
        }
      : null;
    return { ...user, presence: { ...user.presence, cursor } };
  };

  const myselfTransformed = myself ? transformCursor(myself) : null;
  const otherUsersTransformed = new Map<string, User>();
  otherUsers.forEach((user, id) => {
    otherUsersTransformed.set(id, transformCursor(user));
  });

  return (
    <CursorsContext.Provider
      value={{ otherUsers: otherUsersTransformed, myself: myselfTransformed }}
    >
      {props.children}
    </CursorsContext.Provider>
  );
}
