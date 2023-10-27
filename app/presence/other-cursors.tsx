import Cursor from "./cursor";
import { usePresenceWithCursors } from "./use-cursors";

export default function OtherCursors() {
  const otherUserIds = usePresenceWithCursors((state) =>
    Array.from(state.otherUsers.keys())
  );
  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
      {otherUserIds.map((id) => {
        return <Cursor key={id} userId={id} fill={"#00f"} />;
      })}
    </div>
  );
}
