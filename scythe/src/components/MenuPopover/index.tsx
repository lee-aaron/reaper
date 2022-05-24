import { Popover, PopoverProps } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import React from "react";

const MenuPopover: React.FC<PopoverProps> = ({ children, sx, ...other }) => {
  return (
    <Popover
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      keepMounted
      PaperProps={{
        sx: {
          p: 1,
          width: 200,
          overflow: "inherit",
          ...sx,
        },
      }}
      {...other}
    >
      {children}
    </Popover>
  );
};

export default MenuPopover;
