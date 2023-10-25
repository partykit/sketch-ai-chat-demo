export default function Chats() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">All Chats</h1>
      <ul className="list">
        <li>
          <a href="/chats/hello-world" className="underline">
            hello-world &rarr;
          </a>
        </li>
      </ul>
    </div>
  );
}
