# PartyKit demo: multiplayer AI chat

This app can be used to demonstrate how to add PartyKit to an existing app. It is a multiplayer chat app that uses AI to generate responses.

![](/assets/docs/llama2-screengrab.png)

_The main branch of this demo uses OpenAI. This branch uses llama2 to generate responses, with an optional `shouldReply` function (using Mistral) to control when the AI should respond._

## Setup

Clone this repo.

Copy `.env.example` to `.env` and fill in the required environment variables.

Run `npm install`.

## Demo script

At each stage, you'll need to switch branch and re-run the app to see changes.

The code builds in stages.

### 1️⃣ `demo-01`

```
git checkout demo-01
npm run dev
```

https://github.com/partykit/sketch-ai-chat-demo/assets/265390/9cad8cf0-c49d-428a-ad8b-bbcb4ff8aab5

At this first step, all we have is a UI shell. PartyKit is used only to serve the app.

**What to demo:**

- Open a browser to [127.0.0.1:1999](http://127.0.0.1:1999) and go the _All Chats_ pages. These are hard-coded chatrooms.
- Enter a room. Tap sign-in at the top right and enter your name. This sign-in only sets your name on the client; it has no back-end.
- Adding a message makes it appear in the chat. Look at `app/components/room.tsx` -- the list of messages is in state, and new messages can be added.
- Show that refreshing the page loses the messages. Open another browser window to the same room. Show that messages are not shared between browsers.
- Show the PartyKit setup: this UI shell is a Remix app, and PartyKit is used only to serve the app. This is not a mandatory way to use PartyKit; usually you'll have your own app server.

### 2️⃣ `demo-02`

```
git checkout demo-02
npm run dev
```

https://github.com/partykit/sketch-ai-chat-demo/assets/265390/da2244c3-db87-47b2-9acc-eb6ae265e366

**What's new:**

- The chatrooms now have a PartyKit backend.

**What to demo:**

- Look at how `app/components/room.tsx` has changed. The hook `usePartySocket` creates a websocket connection. JSON messages are received: the whole message history and also updates.
- Note that the `addMessage` function in that component has changed: it now sends new messages using the socket.
- Show the new behaviour in a web browser: messages are now shared between browsers. Refreshing the page no longer loses messages.
- Now show the PartyKit server in `party/chatRoom.ts`: the message history is kept in-memory (this could be persisted using storage). When a client connects, they receive the message history in `onConnect`. When a client sends a message, `onMessage` broadcasts it to all connected clients (but note the list of excluded IDs).
- Look at `partykit.json` to see how PartyKit learns about this party server. We can deploy this with `npx partykit deploy` or (better) `npm run deploy` which will build the Remix app first (you can see the commands in `package.json`). Do this now.

### 3️⃣ `demo-03`

```
git checkout demo-03
npm run dev
```

https://github.com/partykit/sketch-ai-chat-demo/assets/265390/6933d024-94d5-45da-88e6-23a12bd05055

**What's new:**

- An AI responds to every message.

**What to demo:**

- Type a message in a chatroom like `write a haiku about dolphins` -- the AI will respond.
- Show that this is multiplayer. From another browser type into the same room: `now about space` -- you'll get a second haiku.
- Look at `app/components/room.tsx` -- nothing has changes on the client side.
- Look at `party/chatRoom.ts` -- there's a new `await this.replyWithAI();` line in `onMessage`. This function calls the OpenAI API with our message history, then creates a new message in the history. Whenever a new token is received, the message is updated and broadcast to all connected clients.
- Look briefly at `party/utils/openai.ts`. This is a simple wrapper around OpenAI's streaming API. There's some logic that returns the number of tokens used by the result but we're not using that here.
- Tap _Usage_ at the top of the app. This will show you a page with a big "0" in the middle. Look at `app/routes/usage.tsx` for the code. There's a number, `tally`, which we want to count up the token usage from all OpenAI calls, but it's just being displayed, not updated. This is what we want to enable next.

### 4️⃣ `demo-04`

```
git checkout demo-04
npm run dev
```

https://github.com/partykit/sketch-ai-chat-demo/assets/265390/a4f0c42a-6850-44a5-9bd1-3efbeeaf3c5a

**What's new:**

- OpenAI API token usage tracking.

**What to demo:**

- Look at `party/usage.ts`. It has a tally which it sends to all new connections in `onConnect`. Briefly look at `partykit.json` to see how it has been added there too.
- In the same `usage` party server, see `onRequest`. Party servers can handle HTTP too. This server only needs one room (the single name is declared as `USAGE_SINGLETON_ROOM_ID` at the top). When this server receives a `POST`, it adds the number of tokens to the tally, and broadcasts the updated tally to all clients.
- How is token usage reported? Return to `party/chatRoom.ts` and look at the bottom of the `replyWithAI` method: PartyKit projects can host multiple parties which can communicate with one-another using both websockets and HTTP. Here the `chatRoom` party server is using `fetch` to send a `POST` request to the `usage` party server. This points at how PartyKit can be used to build complex, distributed apps.

### 5️⃣ `demo-05`

```
git checkout demo-05
npm run dev
```

https://github.com/partykit/sketch-ai-chat-demo/assets/265390/3a5a667e-2344-43eb-8e1b-0f8077e5e4a3

**What's new:**

- Multiplayer cursors in chatrooms

**What to do:**

- We've now added a presence library, supplied by PartyKit. This provides synced user objects to the client, together with real-time presence, and you can extend that to do whatever you want. Here we're going to use it to add multiplayer cursors. We don't need to look closely, but note these new files:
  - `party/presence.ts` -- provides the back-end for synced user objects. It uses `msgpack` instead of JSON, and `zod` to validate the data.
  - `app/providers/presence-context.tsx` -- provides the client-side context for synced user objects. This is pretty generic.
  - `app/providers/cursors-context.tsx` -- it comes with this additional context which tracks cursor positions and adds them to the synced user objects.
  - `app/routes/chats.$roomName.tsx` -- this is where the providers have been added. Note that we're setting `partykitHost` from an environment variable (handy to move between dev, staging and production) and the room name comes from a prop. You'll see `<OtherCursors />` in here.
  - `app/components/presence/other-cursors.tsx` -- note `useCursors()` in here. This comes from the cursors context.
- See this in action! Open two browsers to the same room, e.g. [127.0.0.1:1999/chats/hello-world](http://127.0.0.1:1999/chats/hello-world). Note the cursors between them. The PartyKit server has tagged the user object with their country of origin, using Cloudflare, and that is displayed as a flag.
- We could now extend this to make the _Sign in_ functionality work with the back-end, and add a UI widget of connected users to the room. But we'll leave that for another day.
- Finally run `npm run deploy` once again and show the new version in production, e.g. [ai-chat-demo.genmon.partykit.dev](https://ai-chat-demo.genmon.partykit.dev)
