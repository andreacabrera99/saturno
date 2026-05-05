"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { STRIPE_PUBLISHABLE_KEY } from "@/lib/stripe-buttons";

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      "stripe-buy-button": {
        "buy-button-id": string;
        "publishable-key": string;
        children?: React.ReactNode;
      };
    }
  }
}

interface Props {
  buyButtonId: string;
}

export default function StripeBuyButton({ buyButtonId }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = wrapperRef.current?.querySelector(
      "stripe-buy-button"
    ) as HTMLElement | null;
    if (!host) return;

    let cleanup: (() => void) | undefined;

    function injectStyle(root: ShadowRoot) {
      if (root.querySelector("[data-saturno-w]")) return;
      const s = document.createElement("style");
      s.setAttribute("data-saturno-w", "");
      // :host targets the stripe-buy-button element itself from within the shadow root
      // iframe is the actual rendered button Stripe injects
      s.textContent =
        ":host{display:block!important;width:100%!important}" +
        "iframe{width:100%!important}";
      root.prepend(s);
    }

    function setup() {
      const root = host!.shadowRoot;
      if (!root) return;
      injectStyle(root);
      // Re-run if Stripe appends children asynchronously (e.g. the iframe)
      const mo = new MutationObserver(() => injectStyle(root));
      mo.observe(root, { childList: true, subtree: true });
      cleanup = () => mo.disconnect();
    }

    if (host.shadowRoot) {
      setup();
    } else {
      // Wait for Stripe's script to define and upgrade the custom element
      customElements.whenDefined("stripe-buy-button").then(() => {
        requestAnimationFrame(setup);
      });
    }

    return () => cleanup?.();
  }, [buyButtonId]);

  return (
    <div ref={wrapperRef} className="w-full">
      <Script
        src="https://js.stripe.com/v3/buy-button.js"
        strategy="afterInteractive"
      />
      <stripe-buy-button
        buy-button-id={buyButtonId}
        publishable-key={STRIPE_PUBLISHABLE_KEY}
      />
    </div>
  );
}
