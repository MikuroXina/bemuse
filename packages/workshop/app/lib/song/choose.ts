import { extract } from "./extract";
import type { Action } from "./reducer";

export const choose = async (dispatch: (action: Action) => void): Promise<void> => {
    try {
      const dir = await window.showDirectoryPicker({ mode: "readwrite" });
      dispatch(["OPEN", dir])
      await extract(dir, dispatch)
    } catch (e) {
      console.error(e);
      dispatch(["CLOSE", []])
    }
}
