import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPolicyPage } from "./privacy-policy";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPolicyPage,
});
