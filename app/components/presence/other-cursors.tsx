import { useCursors } from "~/providers/cursors-context";
import Cursor from "./cursor";

export default function OtherCursors() {
  const { otherUsers } = useCursors();
  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
      {[...otherUsers].map(([id, user]) => {
        if (!user.presence?.cursor) return null;
        return (
          <Cursor
            key={id}
            id={id}
            fill={"#00f"}
            x={user.presence.cursor.x}
            y={user.presence.cursor.y}
            pointer={user.presence.cursor.pointer}
            country={user.country}
            message={user.presence.message ?? null}
          />
        );
      })}
    </div>
  );
}
