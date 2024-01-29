export const id = {
  /**
   * A unique ID. The component `_uid` will be used as default.
   */
  id: {
    type: [Number, String],
    default() {
      return (this as any)._uid;
    },
  },
};
