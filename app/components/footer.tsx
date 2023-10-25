const navigation = [{ name: "Chat", href: "/chats" }];

export default function Footer() {
  return (
    <footer className="bg-white mt-auto">
      <div
        className="mx-auto flex max-w-7xl items-center justify-between p-6"
        aria-label="Global"
      >
        <div className="flex flex-1">
          <a href="/" className="-m-1.5 p-1.5 text-sm text-black/60">
            🎈 Built with{" "}
            <a href="https://www.partykit.io" className="underline">
              PartyKit
            </a>
          </a>
        </div>
      </div>
    </footer>
  );
}
