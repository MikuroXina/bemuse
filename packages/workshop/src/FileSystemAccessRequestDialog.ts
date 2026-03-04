export async function showFileSystemAccessRequestDialog() {
  const div = document.createElement("div");
  document.body.appendChild(div);
  try {
    return await new Promise<void>((resolve, reject) => {
      div.innerHTML = `<ui5-dialog data-id="dialog" header-text="Permission required">
        <ui5-label>Please allow access to file system</ui5-label>
        <div slot="footer" style="padding: 0.5rem">
          <ui5-button design="Emphasized" data-id="allow">
            Allow
          </ui5-button>
          <ui5-button design="Negative" data-id="deny">
            Deny
          </ui5-button>
        </div>
      </ui5-dialog>`;
      const permissionDialog = div.querySelector("[data-id=dialog]") as any;
      const allowButton = div.querySelector("[data-id=allow]");
      const denyButton = div.querySelector("[data-id=deny]");
      permissionDialog.addEventListener("before-close", () => {
        reject(new Error("Dialog closed"));
      });
      allowButton.addEventListener("click", () => {
        resolve();
        permissionDialog.close();
      });
      denyButton.addEventListener("click", () => {
        permissionDialog.close();
      });
      permissionDialog.show();
    });
  } finally {
    document.body.removeChild(div);
  }
}
