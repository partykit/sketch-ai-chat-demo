import { Link } from "@remix-run/react";
import { rooms } from "~/shared";

export default function RoomsList() {
  return (
    <ul
      role="list"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {rooms.map((room) => (
        <li
          key={room.slug}
          className="col-span-1 divide-y divide-stone-300 rounded bg-white shadow border border-stone-300"
        >
          <div className="flex w-full items-center justify-between space-x-6 p-6">
            <div className="flex-1 truncate">
              <div className="flex items-center space-x-3">
                <h3 className="truncate font-semibold text-stone-900">
                  {room.name}
                </h3>
              </div>
              <p className="mt-1 truncate text-stone-500">{room.description}</p>
            </div>
          </div>
          <div>
            <div className="-mt-px flex divide-x divide-stone-300">
              <div className="flex w-0 flex-1">
                <Link
                  to={`/chats/${room.slug}`}
                  className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl border border-transparent py-4 font-semibold text-gray-900"
                >
                  Chat &rarr;
                </Link>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
