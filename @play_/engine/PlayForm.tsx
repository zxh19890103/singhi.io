import React, { useEffect, useRef } from "react";
import type { PlayEngine } from "./PlayEngine.js";
import { Form } from "./interactive/form.js";

export function PlayFormApp<E extends PlayEngine>(
  props: React.PropsWithChildren<{
    engine: E;
  }>,
) {
  const elementRef = useRef<HTMLDivElement>(null);

  const { playForm } = props.engine;

  useEffect(() => {
    playForm.element = elementRef.current;
    return () => {
      playForm.element = null;
    };
  }, []);

  const onInput: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.stopPropagation();
    event.preventDefault();

    const input = event.target as HTMLInputElement;
    const inputName = input.name;

    switch (input.tagName) {
      case "INPUT": {
        playForm._callSpy(inputName, input.value);
        break;
      }
      case "SELECT": {
        playForm._callSpy(inputName, input.value);
        break;
      }
      default: {
        break;
      }
    }
  };

  const onExit = () => {
    playForm.blur();
  };

  return (
    <div className="PlayForm" ref={elementRef}>
      <div>
        {/* <Form values={} onChange={() => {}}>{props.children}</Form> */}
      </div>
      <div>
        <button onClick={onExit}>exit</button>
      </div>
    </div>
  );
}
