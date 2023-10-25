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

  return <h1>Hello, World!</h1>;
}
