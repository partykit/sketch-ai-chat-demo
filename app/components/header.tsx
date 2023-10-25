import { useState } from "react";
import { useUser } from "~/providers/user-context";
import Overlay from "./header-overlay";
import type { User } from "~/shared";

const navigation = [{ name: "All Chats", href: "/chats" }];

export default function Header() {
  const { user, setUser } = useUser();
  const [showOverlay, setShowOverlay] = useState(false);

  const handleSignIn = () => {
    setUser({ name: "Guest" });
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
            <a href="/" className="-m-1.5 p-1.5 font-semibold uppercase">
              <span>My Chat App</span>
            </a>
          </div>
          <div className="flex gap-x-12">
            {navigation.map((item) => (
              <a key={item.name} href={item.href} className="font-semibold">
                {item.name}
              </a>
            ))}
          </div>
          <div className="flex flex-1 justify-end">
            {user && (
              <div className="flex items-center gap-x-2">
                <span>Hi {user.name}!</span>
                <a
                  href="#"
                  className="font-semibold"
                  onClick={() => setUser(null)}
                >
                  Logout
                </a>
              </div>
            )}
            {!user && (
              <div
                className="border border-stone-400 rounded-full px-3 py-1 cursor-pointer"
                onClick={handleSignIn}
              >
                Sign in
              </div>
            )}
          </div>
        </nav>
      </header>
    </>
  );
}
