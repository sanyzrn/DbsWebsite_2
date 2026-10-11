# Store artwork

Self-hosted brand artwork; no runtime third-party requests. These marks identify their respective marketplaces. All five Nex destinations are explicitly **Coming soon**; no download badge, store URL or current platform availability is implied.

| File | Source | Presentation |
| --- | --- | --- |
| `bazaar.png` | Cafe Bazaar's own website icon: https://webassets.cafebazaar.ir/images/icons/android-icon-192x192.png (linked from https://cafebazaar.ir/) | Original 192px green shopping-bag mark, shown at 32px. |
| `myket.png` | Myket's own website icon: https://myket.ir/core/images/logo/favicon/android-icon-192x192.png (linked from https://myket.ir/) | Original 192px blue Myket mark, shown at 32px. |
| `googleplay.svg` | https://github.com/gilbarbara/logos/blob/main/logos/google-play-icon.svg | Original four-colour Google Play mark. |
| `appstore.svg` | https://github.com/simple-icons/simple-icons/blob/develop/icons/appstore.svg | App Store outline from Simple Icons (CC0), filled in App Store blue `#0D96F6`. |
| `microsoftstore.svg` | https://github.com/microsoft/fluentui-system-icons/blob/main/assets/Store%20Microsoft/SVG/ic_fluent_store_microsoft_24_filled.svg | Microsoft's Store silhouette, filled in Microsoft blue `#0078D4`. MIT license preserved alongside the file. |

Brand ownership remains with the respective marketplace. Logos are never generated, animated or recoloured by the page theme. Activating a destination requires the real URL in `NEX_STORES` in `src/lib/nex.ts`; until then, the UI renders a native disabled button with a visible coming-soon label.
