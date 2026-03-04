<main>
  <ui5-shellbar id="shellbar" primary-title="Bemuse Custom Song Workshop"
  ></ui5-shellbar>

  <ui5-product-switch>
    <ui5-product-switch-item
      title-text="Custom Song"
      subtitle-text="Prepare song data"
      icon="factory"
      onclick={() => (location.href = "?app=song")}
    ></ui5-product-switch-item>
    <ui5-product-switch-item
      title-text="Server Manager"
      subtitle-text="Prepare server file"
      icon="shelf"
      onclick={() => (location.href = "?app=server-manager")}
    ></ui5-product-switch-item>
    <ui5-product-switch-item
      title-text="Renoter"
      subtitle-text="Edit notes"
      icon="edit"
      onclick={() => (location.href = "?app=renoter")}
    ></ui5-product-switch-item>
  </ui5-product-switch>
</main>
