import { PlayEngine, PlayFormApp, dom } from "@play/engine";

export const App = (props: { engine: PlayEngine }) => {
  return (
    <PlayFormApp engine={props.engine}>
      <dom.FormItem name="key1">
        <dom.CuteColorInput />
      </dom.FormItem>
    </PlayFormApp>
  );
};
