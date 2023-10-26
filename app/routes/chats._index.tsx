import RoomsList from "~/components/rooms-list";

export default function Chats() {
  return (
    <div className="w-full">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">All Chats</h1>
      <RoomsList />
    </div>
  );
}
