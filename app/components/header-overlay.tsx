import { useState } from "react";
import SetUsernameForm from "./set-username-form";
import type { User } from "~/types";

export default function Overlay(props: {
  dismiss: () => void;
  setUser: (user: any) => void;
}) {
  const handleSetUserName = (name: string) => {
    props.setUser({ name });
    props.dismiss();
  };

  return (
    <div className="z-10 absolute top-0 left-0 bottom-0 right-0 bg-black/70 backdrop-blur-sm flex justify-center items-center">
      <div className="text-white justify-center items-center flex flex-col gap-12">
        <SetUsernameForm setUsername={handleSetUserName} />
        <button className="text-sm" onClick={() => props.dismiss()}>
          Close
        </button>
      </div>
    </div>
  );
}
