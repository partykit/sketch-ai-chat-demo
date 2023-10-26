import { useLoaderData } from "@remix-run/react";
import Room from "~/components/room";

type LoaderFunctionArgs = { context: any; params: { roomName: string } };

declare const PARTYKIT_HOST: string;
export async function loader({ context, params }: LoaderFunctionArgs) {
  return { partykitHost: PARTYKIT_HOST, ...context, ...params };
}

export default function Chats() {
  const { partykitHost, roomName } = useLoaderData<typeof loader>();

  return (
    <div className="grow w-full h-full flex flex-col justify-start">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">
        Chat: {roomName}
      </h1>
      <Room host={partykitHost} roomName={roomName} />
    </div>
  );
}
