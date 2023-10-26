import SetUsernameForm from "./set-username-form";
import type { User } from "~/shared";

export default function Overlay(props: {
  dismiss: () => void;
  setUser: (user: any) => void;
}) {
  const handleSetUserName = (name: string) => {
    console.log("setting user name", name);
    props.setUser({ name: name } as User);
    props.dismiss();
  };

  return (
    <div
      style={{ WebkitBackdropFilter: "blur(5px)" }}
      className="z-10 absolute top-0 left-0 bottom-0 right-0 bg-black/70 backdrop-blur-sm flex justify-center items-center"
    >
      <div className="text-white justify-center items-center flex flex-col gap-12">
        <SetUsernameForm setUsername={handleSetUserName} />
        <button className="text-sm" onClick={() => props.dismiss()}>
          Close
        </button>
      </div>
    </div>
  );
}
