"use client";

import { useFormStatus } from "react-dom";
import LoadingOverlay from "./LoadingOverlay";

export default function FormLoadingOverlay({ title, message }) {
  const { pending } = useFormStatus();

  return <LoadingOverlay show={pending} title={title} message={message} />;
}
