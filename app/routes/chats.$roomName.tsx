import { useLoaderData } from "@remix-run/react";
import Room from "~/components/room";

type LoaderFunctionArgs = { params: { roomName: string } };

export async function loader({ params }: LoaderFunctionArgs) {
  return params;
}
export default function Chats() {
  const { roomName } = useLoaderData<typeof loader>();

  return (
    <div className="grow w-full h-full flex flex-col justify-start">
      <h1 className="text-2xl font-semibold text-gray-900">Chat: {roomName}</h1>
      <Room roomName={roomName} />
    </div>
  );
}
