import type * as Party from "partykit/server";

export const USAGE_SINGLETON_ROOM_ID = "total";

export default class UsageServer implements Party.Server {
  tally: number = 0;

  constructor(public party: Party.Party) {}

  onConnect(connection: Party.Connection) {
    connection.send(JSON.stringify({ tally: this.tally }));
  }

  async onRequest(request: Party.Request) {
    if (this.party.id !== USAGE_SINGLETON_ROOM_ID) {
      return new Response("Not Found", { status: 404 });
    }

    if (request.method === "POST") {
      const { usage } = (await request.json()) as { usage: number };
      this.tally += usage;
      this.party.broadcast(JSON.stringify({ tally: this.tally }));
    }

    return new Response("Method Not Allowed", { status: 405 });
  }
}
