import { useState } from "react";

export default function SetUsernameForm(props: {
  setUsername: (name: string) => void;
}) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name) return;
    props.setUsername(name);
    setName("");
  };

  return (
    <form
      className="w-full flex justify-between gap-2 items-center"
      onSubmit={handleSubmit}
    >
      <label htmlFor="name">Your name</label>
      <input
        type="text"
        name="name"
        placeholder="e.g. Sunil"
        value={name}
        className="grow border border-stone-300 text-stone-900 p-2"
        onChange={(e) => setName(e.target.value)}
      />
      <button
        className="grow-0 border border-stone-300 px-4 py-2 rounded"
        type="submit"
      >
        Set name
      </button>
    </form>
  );
}
