import { createSlice, nanoid } from "@reduxjs/toolkit";
import { DEFAULT_DISMISS_MS } from "../../constants/misc";

export type PopupContent = string;

export enum ApplicationModal {
  SETTINGS,
  NAVIGATION
}

type PopupList = Array<{
  key: string;
  show: boolean;
  content: PopupContent;
  type: "error" | "warning" | "success" | "info";
  removeAfterMs: number | null;
}>;

export interface ApplicationState {
  readonly openModal: ApplicationModal | null;
  readonly popupList: PopupList;
  readonly anchorEl: Record<ApplicationModal, string>;
}

const initialState: ApplicationState = {
  openModal: null,
  popupList: [],
  anchorEl: Object.assign(
    {},
    ...Object.keys(ApplicationModal).map((key) => ({ [key]: "" }))
  ),
};

const applicationSlice = createSlice({
  name: "application",
  initialState,
  reducers: {
    setOpenModal(state, action) {
      state.openModal = action.payload;
    },
    setAnchorEl(state, action) {
      const { key, el } = action.payload;
      if (key in ApplicationModal) {
        state.anchorEl[key as ApplicationModal] = el;
      }
    },
    addPopup(
      state,
      { payload: { content, key, removeAfterMs = DEFAULT_DISMISS_MS, type } }
    ) {
      state.popupList = (
        key
          ? state.popupList.filter((popup) => popup.key !== key)
          : state.popupList
      ).concat([
        {
          key: key || nanoid(),
          show: true,
          content,
          removeAfterMs,
          type,
        },
      ]);
    },
    removePopup(state, { payload: { key } }) {
      state.popupList.forEach((p) => {
        if (p.key === key) {
          p.show = false;
        }
      });
    },
  },
});

export const {
  setOpenModal,
  addPopup,
  removePopup,
  setAnchorEl,
} = applicationSlice.actions;
export default applicationSlice.reducer;
