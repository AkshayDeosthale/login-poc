"use client";
import React from "react";
import { DropdownMenuLabel } from "./ui/dropdown-menu";
import { FaCopy } from "react-icons/fa";

type Props = { address: string };

const ClickToCopy = ({ address }: Props) => {
  return (
    <DropdownMenuLabel
      onClick={async () => {
        await navigator.clipboard.writeText(address);
      }}
      className="flex items-center justify-between py-6 cursor-pointer"
    >
      <p className="truncate w-[250px]">{address}</p>
      <FaCopy />
    </DropdownMenuLabel>
  );
};

export default ClickToCopy;
