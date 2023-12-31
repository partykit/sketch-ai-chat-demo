import { useState } from "react";
import { useUser } from "~/providers/user-context";
import Overlay from "./header-overlay";
import { Link } from "@remix-run/react";

const navigation = [
  { name: "All Chats", href: "/chats" },
  { name: "Usage", href: "/usage" },
];

export default function Header() {
  const { user, setUser } = useUser();
  const [showOverlay, setShowOverlay] = useState(false);

  const handleSignIn = () => {
    setShowOverlay(true);
  };

  return (
    <>
      {showOverlay && (
        <Overlay dismiss={() => setShowOverlay(false)} setUser={setUser} />
      )}
      <header className="grow-0 bg-white">
        <nav
          className="mx-auto h-20 flex max-w-7xl items-center justify-between p-6 text-sm text-stone-900"
          aria-label="Global"
        >
          <div className="flex flex-1">
            <Link to="/" className="-m-1.5 p-1.5 font-semibold uppercase">
              <span>My Chat App</span>
            </Link>
          </div>
          <div className="flex gap-x-12">
            {navigation.map((item) => (
              <Link key={item.name} to={item.href} className="font-semibold">
                {item.name}
              </Link>
            ))}
          </div>
          <div className="flex flex-1 justify-end">
            {user && (
              <div className="flex items-center gap-x-2">
                <span>Hi {user.name}!</span>
                <button
                  className="font-semibold cursor-pointer"
                  onClick={() => setUser(null)}
                >
                  Logout
                </button>
              </div>
            )}
            {!user && (
              <button
                className="border border-stone-400 rounded-full px-3 py-1 cursor-pointer"
                onClick={handleSignIn}
              >
                Sign in
              </button>
            )}
          </div>
        </nav>
      </header>
    </>
  );
}
