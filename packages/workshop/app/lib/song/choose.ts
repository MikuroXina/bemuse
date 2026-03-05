import type { Action } from "./reducer";

export const choose = async (dispatch: (action: Action) => void): Promise<void> => {
    try {
      const dir = await window.showDirectoryPicker({ mode: "readwrite" });
      dispatch(["OPEN", dir])
    } catch (e) {
      console.error(e);
      dispatch(["CLOSE", []])
    }
}
