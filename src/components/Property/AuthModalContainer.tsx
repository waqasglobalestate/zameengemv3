"use client";

import React from "react";
import { useAppState } from "@/context/AppStateContext";
import AddPropertyAuthModal from "./AddPropertyAuthModal";

export default function AuthModalContainer() {
  const { isAuthModalOpen, setIsAuthModalOpen } = useAppState();

  return (
    <AddPropertyAuthModal
      isOpen={isAuthModalOpen}
      onClose={() => setIsAuthModalOpen(false)}
    />
  );
}
