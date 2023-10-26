import { useLoaderData } from "@remix-run/react";
import Room from "~/components/room";
import { rooms } from "~/shared";
import PresenceContextProvider from "~/providers/presence-context";
import CursorsContextProvider from "~/providers/cursors-context";
import OtherCursors from "~/components/presence/other-cursors";

type LoaderFunctionArgs = { context: any; params: { roomName: string } };

declare const PARTYKIT_HOST: string;
export async function loader({ context, params }: LoaderFunctionArgs) {
  return { partykitHost: PARTYKIT_HOST, ...context, ...params };
}

export default function Chats() {
  const { partykitHost, roomName } = useLoaderData<typeof loader>();

  // Get the room where roomName matches slug in rooms array
  const room = rooms.find((room) => room.slug === roomName);
  if (!room) return;

  return (
    <PresenceContextProvider
      host={partykitHost}
      room={roomName}
      presence={{ cursor: null, message: null }}
      info={{ name: "Default name" }}
    >
      <CursorsContextProvider>
        <OtherCursors />
        <div className="grow w-full h-full flex flex-col justify-start">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            Room: {room.name}
          </h1>
          <Room host={partykitHost} roomName={room.slug} />
        </div>
      </CursorsContextProvider>
    </PresenceContextProvider>
  );
}
