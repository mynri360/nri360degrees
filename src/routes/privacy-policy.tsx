import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPolicyPage } from "./privacy";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | NRI360" },
      {
        name: "description",
        content:
          "Privacy Policy for NRI360DEGREES. Learn how we collect, use, store, share and protect your personal data in accordance with IT Act 2000 and DPDP Act 2023.",
      },
      { property: "og:title", content: "Privacy Policy | NRI360" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: PrivacyPolicyPage,
});
