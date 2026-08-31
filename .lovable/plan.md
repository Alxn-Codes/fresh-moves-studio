# Nine-Bottle Splash Collection

## What will change
- Expand PULPA from five to nine distinct juice products, each with its own flavor, color, product details, and fruit identity.
- Reshape every 3D bottle to match the reference: a compact rounded body, soft shoulders, short neck, and broad metallic cap.
- Replace the side pour with a full hero splash that wraps behind and around the active bottle, including rising liquid ribbons, animated droplets, splash arcs, and matching floating fruit forms.
- Apply the same animated splash treatment to every bottle as the carousel advances or a product is selected.
- Update all page copy and product counts from five to nine while preserving the existing About and Contact sections.

## Technical details
- Keep the current React Three Fiber scene and create reusable procedural fruit/splash components driven by each product’s data.
- Use shared geometries/materials and a mobile-conscious particle count to keep all nine products smooth.
- Ensure animation uses frame delta, resets cleanly per active bottle, and respects reduced-motion preferences where practical.
- Verify the final result in the live browser at desktop and mobile sizes, checking scene framing, motion, product selection, console errors, and build status.
