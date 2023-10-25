import { useLoaderData } from "@remix-run/react";

type LoaderFunctionArgs = { params: { roomName: string } };

export async function loader({ params }: LoaderFunctionArgs) {
  return params;
}
export default function Chats() {
  const { roomName } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>Chat: {roomName}</h1>
    </div>
  );
}
