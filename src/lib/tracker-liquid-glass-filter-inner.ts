/** SVG <filter id="tracker-liquid-glass-fr"> — feDisplacementMap (liquid glass).
 *  Carte déportée : `/tracker-liquid-glass-map.webp` (~12 Ko public), plus de méga-string en JS.
 *  @see https://kube.io/blog/liquid-glass-css-svg/
 */
export const TRACKER_LIQUID_GLASS_FILTER_INNER = `<filter id="tracker-liquid-glass-fr" color-interpolation-filters="sRGB" filterUnits="objectBoundingBox" primitiveUnits="objectBoundingBox" x="-0.5" y="-0.5" width="2" height="2">
        <feImage result="map" x="0" y="0" width="1" height="1" preserveAspectRatio="none" href="/tracker-liquid-glass-map.webp" />
        <feDisplacementMap
          id="disp"
          in="SourceGraphic"
          in2="map"
          scale="0.2"
          edgeMode="duplicate"
          xChannelSelector="R"
          yChannelSelector="G" />
      </filter>`;
