import { useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";

type LoaderFunctionArgs = { context: any };

declare const PARTYKIT_HOST: string;
export async function loader({ context }: LoaderFunctionArgs) {
  return { partykitHost: PARTYKIT_HOST, ...context };
}

export default function Usage() {
  const { partykitHost } = useLoaderData<typeof loader>();
  const [tally, setTally] = useState(0);
  const [displayTally, setDisplayTally] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayTally((prev) => {
        if (prev === tally) {
          clearInterval(interval);
          return tally;
        }
        return prev + Math.sign(tally - prev);
      });
    }, 20);

    return () => clearInterval(interval);
  }, [tally]);

  return (
    <div className="flex flex-col justify-center items-center w-full gap-4 pt-6">
      <div className="font-semibold text-9xl">{displayTally}</div>
      <div className="text-2xl text-stone-900">Tokens used with OpenAI</div>
    </div>
  );
}
