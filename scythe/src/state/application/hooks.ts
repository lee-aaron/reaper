import { useCallback, useMemo } from "react";
import { DEFAULT_DISMISS_MS } from "../../constants/misc";
import { useAppDispatch, useAppSelector } from "../hooks";
import { AppState } from "../index";
import {
  addPopup,
  ApplicationModal,
  PopupContent,
  removePopup,
  setAnchorEl,
  setOpenModal,
} from "./reducer";

export function useModalOpen(modal: ApplicationModal): boolean {
  const openModal = useAppSelector(
    (state: AppState) => state.application.openModal
  );
  return openModal === modal;
}

export function useToggleModal(modal: ApplicationModal): () => void {
  const open = useModalOpen(modal);
  const dispatch = useAppDispatch();
  return useCallback(
    () => dispatch(setOpenModal(open ? null : modal)),
    [dispatch, modal, open]
  );
}

export function useAnchorEl(modal: ApplicationModal): any {
  const el = useAppSelector(
    (state: AppState) => state.application.anchorEl[modal]
  );
  return el;
}

export function useAnchorElCallback(
  modal: ApplicationModal
): (el: any) => void {
  const dispatch = useAppDispatch();
  return useCallback(
    (el) => dispatch(setAnchorEl({ key: modal, el })),
    [dispatch]
  );
}

export function useToggleSettingsMenu(): () => void {
  return useToggleModal(ApplicationModal.SETTINGS);
}

export function useShowSettingsMenu(): boolean {
  return useModalOpen(ApplicationModal.SETTINGS);
}

export function useToggleNavMenu(): () => void {
  return useToggleModal(ApplicationModal.NAVIGATION);
}

export function useShowNavMenu(): boolean {
  return useModalOpen(ApplicationModal.NAVIGATION);
}

// returns a function that allows adding a popup
export function useAddPopup(): (
  content: PopupContent,
  type: string,
  key?: string,
  removeAfterMs?: number
) => void {
  const dispatch = useAppDispatch();

  return useCallback(
    (
      content: PopupContent,
      type: string,
      key?: string,
      removeAfterMs?: number
    ) => {
      dispatch(
        addPopup({
          content,
          key,
          removeAfterMs: removeAfterMs ?? DEFAULT_DISMISS_MS,
          type,
        })
      );
    },
    [dispatch]
  );
}

// returns a function that allows removing a popup via its key
export function useRemovePopup(): (key: string) => void {
  const dispatch = useAppDispatch();
  return useCallback(
    (key: string) => {
      dispatch(removePopup({ key }));
    },
    [dispatch]
  );
}

// get the list of active popups
export function useActivePopups(): AppState["application"]["popupList"] {
  const list = useAppSelector((state: AppState) => state.application.popupList);
  return useMemo(() => list.filter((item) => item.show), [list]);
}
