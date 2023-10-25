const navigation = [{ name: "All Chats", href: "/chats" }];

export default function Header() {
  return (
    <header className="grow-0 bg-white">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-6"
        aria-label="Global"
      >
        <div className="flex flex-1">
          <a href="/" className="-m-1.5 p-1.5 text-sm font-semibold uppercase">
            <span>My Chat App</span>
          </a>
        </div>
        <div className="flex gap-x-12">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              {item.name}
            </a>
          ))}
        </div>
        <div className="flex flex-1 justify-end">
          <a href="#" className="text-sm font-semibold leading-6 text-gray-900">
            About
          </a>
        </div>
      </nav>
    </header>
  );
}
