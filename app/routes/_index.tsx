import { useLoaderData } from "@remix-run/react";
import type { MetaFunction } from "partymix";

// PartyKit will inject the host into the server bundle
// so let's read it here and expose it to the client
declare const PARTYKIT_HOST: string;
export function loader({ context }) {
  return { partykitHost: PARTYKIT_HOST, ...context };
}

export const meta: MetaFunction = () => {
  return [
    { title: "AI Chat" },
    { name: "description", content: "PartyKit demo app" },
  ];
};

export default function Index() {
  const { partykitHost } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col justify-start items-start w-full gap-6 pt-6">
      <div className="font-semibold text-7xl">🎈 PartyKit demo</div>
      <div className="text-2xl text-stone-900 max-w-3xl">
        Starting with a UI shell of chatrooms, we’re going to add real-time
        multiplayer interactions and AI chat ...in 10 minutes.
      </div>
    </div>
  );
}
