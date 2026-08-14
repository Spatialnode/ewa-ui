"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import {
  Map as ReactMapLibreMap,
  Marker as ReactMapLibreMarker,
  Popup as ReactMapLibrePopup,
  Source,
  Layer,
  type MarkerInstance,
  type MarkerEvent,
  type MarkerDragEvent,
} from "@vis.gl/react-maplibre";
import { addProtocol, setWorkerUrl } from "maplibre-gl";
import type * as MapLibreGL from "maplibre-gl";
import type { PopupOptions, MarkerOptions, MapLibreEvent } from "maplibre-gl";
import { cogProtocol } from "@geomatico/maplibre-cog-protocol";
import type * as GeoJSON from "geojson";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from "react";
import {
  X,
  Minus,
  Plus,
  Locate,
  Maximize,
  Loader2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

import { cn } from "@/lib/utils";

// Registers the `cog://` protocol so `MapRasterLayer` / `MapHillshade` /
// `MapTerrain` can read Cloud Optimized GeoTIFFs directly from cloud storage
// (HTTP range requests, decoded in the browser) instead of a pre-tiled
// XYZ/TileJSON endpoint — see `cogUrl`. Registering twice is harmless;
// `addProtocol` just replaces the handler for the same name.
addProtocol("cog", cogProtocol);

// Points maplibre-gl at its worker script, vendored next to this file by
// `scripts/copy-maplibre-worker.mjs` — see that file for why.
setWorkerUrl(new URL("./maplibre-gl-worker.mjs", import.meta.url).href);

const defaultStyles = {
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
};

// A tile-less, dependency-free style with a transparent background. Use it for
// data visualizations (choropleths, world arcs, dot maps) where you draw your
// own layers and don't need a street basemap. The easiest way to opt in is the
// `blank` prop:
//   <Map blank>...</Map>
// The transparent background lets the themed container show through.
const blankMapStyle: MapLibreGL.StyleSpecification = {
  version: 8,
  sources: {},
  layers: [
    {
      id: "background",
      type: "background",
      paint: { "background-color": "rgba(0, 0, 0, 0)" },
    },
  ],
};

// Prevent equivalent inline style objects from triggering a full map style reload.
function useStableValue<T>(value: T): T {
  const key = useMemo(() => JSON.stringify(value) ?? "", [value]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => value, [key]);
}

function mergeHoverPaint<T extends Record<string, unknown>>(
  paint: T,
  hoverPaint: T | undefined,
): T {
  if (!hoverPaint) return paint;
  const merged: Record<string, unknown> = { ...paint };
  for (const [key, hoverValue] of Object.entries(hoverPaint)) {
    if (hoverValue === undefined) continue;
    const baseValue = merged[key];
    merged[key] =
      baseValue === undefined
        ? hoverValue
        : [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            hoverValue,
            baseValue,
          ];
  }
  return merged as T;
}

type Theme = "light" | "dark";

// Check the document for an explicit theme (works with next-themes, etc.).
// Covers both `attribute="class"` (the default) and `attribute="data-theme"`.
function getDocumentTheme(): Theme | null {
  if (typeof document === "undefined") return null;
  const root = document.documentElement;
  if (root.classList.contains("dark")) return "dark";
  if (root.classList.contains("light")) return "light";
  const dataTheme = root.dataset.theme;
  if (dataTheme === "dark" || dataTheme === "light") return dataTheme;
  return null;
}

// Get system preference
function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function useResolvedTheme(themeProp?: "light" | "dark"): Theme {
  const [detectedTheme, setDetectedTheme] = useState<Theme>(
    () => getDocumentTheme() ?? getSystemTheme(),
  );

  useEffect(() => {
    if (themeProp) return; // Skip detection if theme is provided via prop

    // Watch for document theme changes (e.g., next-themes toggling the class
    // or the data-theme attribute).
    const observer = new MutationObserver(() => {
      const docTheme = getDocumentTheme();
      if (docTheme) {
        setDetectedTheme(docTheme);
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    // Also watch for system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = (e: MediaQueryListEvent) => {
      // Only use system preference if no document class is set
      if (!getDocumentTheme()) {
        setDetectedTheme(e.matches ? "dark" : "light");
      }
    };
    mediaQuery.addEventListener("change", handleSystemChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", handleSystemChange);
    };
  }, [themeProp]);

  return themeProp ?? detectedTheme;
}

type MapContextValue = {
  map: MapLibreGL.Map | null;
  isLoaded: boolean;
  resolvedTheme: Theme;
};

const MapContext = createContext<MapContextValue | null>(null);

function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMap must be used within a Map component");
  }
  return context;
}

/** Map viewport state */
type MapViewport = {
  /** Center coordinates [longitude, latitude] */
  center: [number, number];
  /** Zoom level */
  zoom: number;
  /** Bearing (rotation) in degrees */
  bearing: number;
  /** Pitch (tilt) in degrees */
  pitch: number;
};

type MapStyleOption = string | MapLibreGL.StyleSpecification;

/** The underlying maplibre-gl map instance. */
type MapRef = MapLibreGL.Map;

type MapProps = {
  children?: ReactNode;
  /** Additional CSS classes for the map container */
  className?: string;
  /**
   * Theme for the map. If not provided, automatically detects system preference.
   * Pass your theme value here.
   */
  theme?: Theme;
  /** Custom map styles for light and dark themes. Overrides the default Carto styles. */
  styles?: {
    light?: MapStyleOption;
    dark?: MapStyleOption;
  };
  /**
   * Use a transparent, tile-less basemap instead of the default Carto street
   * basemap — a blank canvas. Used alone it renders nothing; add your own
   * layers on top (`<MapGeoJSON>`, `<MapArc>`, markers, etc.). Ideal for data
   * visualizations (choropleths, arcs, dot maps).
   * Ignored when an explicit `styles` prop is provided.
   */
  blank?: boolean;
  /** Map projection type. Use `{ type: "globe" }` for 3D globe view. */
  projection?: MapLibreGL.ProjectionSpecification;
  /**
   * Controlled viewport. When provided with onViewportChange,
   * the map becomes controlled and viewport is driven by this prop.
   */
  viewport?: Partial<MapViewport>;
  /**
   * Callback fired continuously as the viewport changes (pan, zoom, rotate, pitch).
   * Can be used standalone to observe changes, or with `viewport` prop
   * to enable controlled mode where the map viewport is driven by your state.
   */
  onViewportChange?: (viewport: MapViewport) => void;
  /** Show a loading indicator on the map */
  loading?: boolean;
  /** Minimum zoom level available to the map. */
  minZoom?: number;
  /** Maximum zoom level available to the map. */
  maxZoom?: number;
  /** Minimum pitch available to the map. */
  minPitch?: number;
  /** Maximum pitch available to the map. */
  maxPitch?: number;
  /** Bounds of the map, as [west, south, east, north]. */
  maxBounds?: [number, number, number, number];
} & Omit<
  MapLibreGL.MapOptions,
  | "container"
  | "style"
  | "center"
  | "zoom"
  | "bearing"
  | "pitch"
  | "minZoom"
  | "maxZoom"
  | "minPitch"
  | "maxPitch"
  | "maxBounds"
>;

function DefaultLoader() {
  return (
    <div className="bg-background/50 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-xs">
      <div className="flex gap-1">
        <span className="bg-muted-foreground/60 size-1.5 animate-pulse rounded-full" />
        <span className="bg-muted-foreground/60 size-1.5 animate-pulse rounded-full [animation-delay:150ms]" />
        <span className="bg-muted-foreground/60 size-1.5 animate-pulse rounded-full [animation-delay:300ms]" />
      </div>
    </div>
  );
}

function getViewport(map: MapLibreGL.Map): MapViewport {
  const center = map.getCenter();
  return {
    center: [center.lng, center.lat],
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
  };
}

const Map = forwardRef<MapRef, MapProps>(function Map(
  {
    children,
    className,
    theme: themeProp,
    styles,
    blank = false,
    projection,
    viewport,
    onViewportChange,
    loading = false,
    ...props
  },
  ref,
) {
  const [rawMap, setRawMap] = useState<MapLibreGL.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const resolvedTheme = useResolvedTheme(themeProp);

  const isControlled = viewport !== undefined && onViewportChange !== undefined;

  const onViewportChangeRef = useRef(onViewportChange);
  onViewportChangeRef.current = onViewportChange;

  const stableStyles = useStableValue(styles);

  const mapStyles = useMemo(() => {
    // Explicit styles win. Otherwise `blank` opts into the transparent
    // tile-less basemap; with neither, fall back to the Carto defaults.
    if (stableStyles) {
      return {
        dark: stableStyles.dark ?? defaultStyles.dark,
        light: stableStyles.light ?? defaultStyles.light,
      };
    }
    if (blank) {
      return { dark: blankMapStyle, light: blankMapStyle };
    }
    return defaultStyles;
  }, [stableStyles, blank]);

  const mapStyle = resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light;

  // Only read once: seeds the camera on construction, matching maplibre-gl's
  // own `initialViewState` semantics (uncontrolled after the first render).
  const initialViewStateRef = useRef({
    longitude: viewport?.center?.[0],
    latitude: viewport?.center?.[1],
    zoom: viewport?.zoom,
    bearing: viewport?.bearing,
    pitch: viewport?.pitch,
  });

  // Expose the raw maplibre-gl map instance to the parent component
  useImperativeHandle(ref, () => rawMap as MapRef, [rawMap]);

  const handleLoad = useCallback((e: MapLibreEvent) => {
    setRawMap(e.target);
    setIsLoaded(true);
  }, []);

  const handleMove = useCallback(
    (e: { viewState: { longitude: number; latitude: number; zoom: number; bearing: number; pitch: number } }) => {
      onViewportChangeRef.current?.({
        center: [e.viewState.longitude, e.viewState.latitude],
        zoom: e.viewState.zoom,
        bearing: e.viewState.bearing,
        pitch: e.viewState.pitch,
      });
    },
    [],
  );

  // Fill any gaps in a partial controlled viewport from the map's current
  // camera, so consumers can control just e.g. `zoom` without fighting pan.
  const current = isControlled && rawMap ? getViewport(rawMap) : undefined;
  const controlledViewState = isControlled
    ? {
        longitude: viewport?.center?.[0] ?? current?.center[0],
        latitude: viewport?.center?.[1] ?? current?.center[1],
        zoom: viewport?.zoom ?? current?.zoom,
        bearing: viewport?.bearing ?? current?.bearing,
        pitch: viewport?.pitch ?? current?.pitch,
      }
    : undefined;

  const contextValue = useMemo(
    () => ({ map: rawMap, isLoaded, resolvedTheme }),
    [rawMap, isLoaded, resolvedTheme],
  );

  return (
    <div className={cn("relative h-full w-full", className)}>
      <ReactMapLibreMap
        renderWorldCopies={false}
        attributionControl={{ compact: true }}
        {...props}
        {...(isControlled
          ? controlledViewState
          : { initialViewState: initialViewStateRef.current })}
        mapStyle={mapStyle}
        projection={projection}
        onLoad={handleLoad}
        onMove={handleMove}
      >
        <MapContext.Provider value={contextValue}>
          {children}
        </MapContext.Provider>
      </ReactMapLibreMap>
      {(!isLoaded || loading) && <DefaultLoader />}
    </div>
  );
});

type MarkerContextValue = {
  isPopupOpen: boolean;
  setIsPopupOpen: (open: boolean) => void;
  isHovered: boolean;
  longitude: number;
  latitude: number;
};

const MarkerContext = createContext<MarkerContextValue | null>(null);

function useMarkerContext() {
  const context = useContext(MarkerContext);
  if (!context) {
    throw new Error("Marker components must be used within MapMarker");
  }
  return context;
}

type MapMarkerProps = {
  /** Longitude coordinate for marker position */
  longitude: number;
  /** Latitude coordinate for marker position */
  latitude: number;
  /** Marker subcomponents (MarkerContent, MarkerPopup, MarkerTooltip, MarkerLabel) */
  children: ReactNode;
  /** Callback when marker is clicked */
  onClick?: (e: MouseEvent) => void;
  /** Callback when mouse enters marker */
  onMouseEnter?: (e: MouseEvent) => void;
  /** Callback when mouse leaves marker */
  onMouseLeave?: (e: MouseEvent) => void;
  /** Callback when marker drag starts (requires draggable: true) */
  onDragStart?: (lngLat: { lng: number; lat: number }) => void;
  /** Callback during marker drag (requires draggable: true) */
  onDrag?: (lngLat: { lng: number; lat: number }) => void;
  /** Callback when marker drag ends (requires draggable: true) */
  onDragEnd?: (lngLat: { lng: number; lat: number }) => void;
} & Omit<MarkerOptions, "element">;

function MapMarker({
  longitude,
  latitude,
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onDragStart,
  onDrag,
  onDragEnd,
  draggable = false,
  ...markerOptions
}: MapMarkerProps) {
  const markerRef = useRef<MarkerInstance>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // react-maplibre's <Marker> doesn't expose onMouseEnter/onMouseLeave props,
  // so bind them directly to the underlying marker element.
  useEffect(() => {
    const el = markerRef.current?.getElement();
    if (!el) return;

    const handleMouseEnter = (e: MouseEvent) => {
      setIsHovered(true);
      onMouseEnter?.(e);
    };
    const handleMouseLeave = (e: MouseEvent) => {
      setIsHovered(false);
      onMouseLeave?.(e);
    };

    el.addEventListener("mouseenter", handleMouseEnter);
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      el.removeEventListener("mouseenter", handleMouseEnter);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [onMouseEnter, onMouseLeave]);

  const handleClick = useCallback(
    (e: MarkerEvent<MouseEvent>) => {
      setIsPopupOpen((open) => !open);
      onClick?.(e.originalEvent);
    },
    [onClick],
  );

  const handleDragStart = useCallback(
    (e: MarkerDragEvent) => {
      onDragStart?.({ lng: e.lngLat.lng, lat: e.lngLat.lat });
    },
    [onDragStart],
  );
  const handleDrag = useCallback(
    (e: MarkerDragEvent) => {
      onDrag?.({ lng: e.lngLat.lng, lat: e.lngLat.lat });
    },
    [onDrag],
  );
  const handleDragEnd = useCallback(
    (e: MarkerDragEvent) => {
      onDragEnd?.({ lng: e.lngLat.lng, lat: e.lngLat.lat });
    },
    [onDragEnd],
  );

  const contextValue = useMemo(
    () => ({ isPopupOpen, setIsPopupOpen, isHovered, longitude, latitude }),
    [isPopupOpen, isHovered, longitude, latitude],
  );

  return (
    <ReactMapLibreMarker
      ref={markerRef}
      longitude={longitude}
      latitude={latitude}
      draggable={draggable}
      onClick={handleClick}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      {...markerOptions}
    >
      <MarkerContext.Provider value={contextValue}>
        {children}
      </MarkerContext.Provider>
    </ReactMapLibreMarker>
  );
}

type MarkerContentProps = {
  /** Custom marker content. Defaults to a blue dot if not provided */
  children?: ReactNode;
  /** Additional CSS classes for the marker container */
  className?: string;
};

function MarkerContent({ children, className }: MarkerContentProps) {
  useMarkerContext();

  return (
    <div className={cn("relative cursor-pointer", className)}>
      {children || <DefaultMarkerIcon />}
    </div>
  );
}

function DefaultMarkerIcon() {
  return (
    <div className="relative h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-lg" />
  );
}

function PopupCloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close popup"
      className="focus-visible:ring-ring hover:bg-muted text-foreground absolute top-1 right-1 z-10 inline-flex size-5 cursor-pointer items-center justify-center rounded-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset"
    >
      <X className="size-3.5" />
    </button>
  );
}

type MarkerPopupProps = {
  /** Popup content */
  children: ReactNode;
  /** Additional CSS classes for the popup container */
  className?: string;
  /** Show a close button in the popup (default: false) */
  closeButton?: boolean;
} & Omit<PopupOptions, "className" | "closeButton">;

function MarkerPopup({
  children,
  className,
  closeButton = false,
  ...popupOptions
}: MarkerPopupProps) {
  const { isPopupOpen, setIsPopupOpen, longitude, latitude } =
    useMarkerContext();

  if (!isPopupOpen) return null;

  const handleClose = () => setIsPopupOpen(false);

  return (
    <ReactMapLibrePopup
      longitude={longitude}
      latitude={latitude}
      offset={16}
      {...popupOptions}
      maxWidth={popupOptions.maxWidth ?? "none"}
      closeButton={false}
      onClose={handleClose}
    >
      <div
        className={cn(
          "bg-popover text-popover-foreground relative max-w-62 rounded-md border p-3 shadow-md",
          "animate-in fade-in-0 zoom-in-95 duration-200 ease-out",
          className,
        )}
      >
        {closeButton && <PopupCloseButton onClick={handleClose} />}
        {children}
      </div>
    </ReactMapLibrePopup>
  );
}

type MarkerTooltipProps = {
  /** Tooltip content */
  children: ReactNode;
  /** Additional CSS classes for the tooltip container */
  className?: string;
} & Omit<PopupOptions, "className" | "closeButton" | "closeOnClick">;

function MarkerTooltip({
  children,
  className,
  ...popupOptions
}: MarkerTooltipProps) {
  const { isHovered, longitude, latitude } = useMarkerContext();

  if (!isHovered) return null;

  return (
    <ReactMapLibrePopup
      longitude={longitude}
      latitude={latitude}
      offset={16}
      {...popupOptions}
      maxWidth={popupOptions.maxWidth ?? "none"}
      closeButton={false}
      closeOnClick={false}
    >
      <div
        className={cn(
          "bg-foreground text-background pointer-events-none rounded-md px-2 py-1 text-xs text-balance shadow-md",
          "animate-in fade-in-0 zoom-in-95 duration-200 ease-out",
          className,
        )}
      >
        {children}
      </div>
    </ReactMapLibrePopup>
  );
}

type MarkerLabelProps = {
  /** Label text content */
  children: ReactNode;
  /** Additional CSS classes for the label */
  className?: string;
  /** Position of the label relative to the marker (default: "top") */
  position?: "top" | "bottom";
};

function MarkerLabel({
  children,
  className,
  position = "top",
}: MarkerLabelProps) {
  const positionClasses = {
    top: "bottom-full mb-1",
    bottom: "top-full mt-1",
  };

  return (
    <div
      className={cn(
        "absolute left-1/2 -translate-x-1/2 whitespace-nowrap",
        "text-foreground text-[10px] font-medium",
        positionClasses[position],
        className,
      )}
    >
      {children}
    </div>
  );
}

type MapControlsProps = {
  /** Position of the controls on the map (default: "bottom-right") */
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  /** Show zoom in/out buttons (default: true) */
  showZoom?: boolean;
  /** Show compass button to reset bearing (default: false) */
  showCompass?: boolean;
  /** Show tilt up/down buttons to control map pitch (default: false) */
  showPitch?: boolean;
  /** Degrees to change pitch by per tilt button click (default: 15) */
  pitchStep?: number;
  /** Show locate button to find user's location (default: false) */
  showLocate?: boolean;
  /** Show fullscreen toggle button (default: false) */
  showFullscreen?: boolean;
  /** Additional CSS classes for the controls container */
  className?: string;
  /** Callback with user coordinates when located */
  onLocate?: (coords: { longitude: number; latitude: number }) => void;
};

const positionClasses = {
  "top-left": "top-2 left-2",
  "top-right": "top-2 right-2",
  "bottom-left": "bottom-2 left-2",
  "bottom-right": "bottom-10 right-2",
};

function ControlGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-border bg-background [&>button:not(:last-child)]:border-border flex flex-col overflow-hidden rounded-md border shadow-sm [&>button:not(:last-child)]:border-b">
      {children}
    </div>
  );
}

function ControlButton({
  onClick,
  label,
  children,
  disabled = false,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      type="button"
      className={cn(
        "flex size-8 items-center justify-center transition-colors",
        "first:rounded-t-md last:rounded-b-md",
        "hover:bg-accent dark:hover:bg-accent/40",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset",
        "disabled:pointer-events-none disabled:opacity-50",
      )}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

function MapControls({
  position = "bottom-right",
  showZoom = true,
  showCompass = false,
  showPitch = false,
  pitchStep = 15,
  showLocate = false,
  showFullscreen = false,
  className,
  onLocate,
}: MapControlsProps) {
  const { map } = useMap();
  const [waitingForLocation, setWaitingForLocation] = useState(false);

  const handleZoomIn = useCallback(() => {
    map?.zoomTo(map.getZoom() + 1, { duration: 300 });
  }, [map]);

  const handleZoomOut = useCallback(() => {
    map?.zoomTo(map.getZoom() - 1, { duration: 300 });
  }, [map]);

  const handleResetBearing = useCallback(() => {
    map?.resetNorthPitch({ duration: 300 });
  }, [map]);

  const handlePitchUp = useCallback(() => {
    if (!map) return;
    const pitch = Math.min(map.getPitch() + pitchStep, map.getMaxPitch());
    map.easeTo({ pitch, duration: 300 });
  }, [map, pitchStep]);

  const handlePitchDown = useCallback(() => {
    if (!map) return;
    const pitch = Math.max(map.getPitch() - pitchStep, map.getMinPitch());
    map.easeTo({ pitch, duration: 300 });
  }, [map, pitchStep]);

  const handleLocate = useCallback(() => {
    if (!("geolocation" in navigator)) return;
    setWaitingForLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          longitude: pos.coords.longitude,
          latitude: pos.coords.latitude,
        };
        map?.flyTo({
          center: [coords.longitude, coords.latitude],
          zoom: 14,
          duration: 1500,
        });
        onLocate?.(coords);
        setWaitingForLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setWaitingForLocation(false);
      },
      // Without a timeout the spec default is Infinity: a dismissed permission
      // prompt would leave the button disabled forever.
      { timeout: 10000 },
    );
  }, [map, onLocate]);

  const handleFullscreen = useCallback(() => {
    const container = map?.getContainer();
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  }, [map]);

  return (
    <div
      className={cn(
        "absolute z-10 flex flex-col gap-1.5",
        positionClasses[position],
        className,
      )}
    >
      {showZoom && (
        <ControlGroup>
          <ControlButton onClick={handleZoomIn} label="Zoom in">
            <Plus className="size-4" />
          </ControlButton>
          <ControlButton onClick={handleZoomOut} label="Zoom out">
            <Minus className="size-4" />
          </ControlButton>
        </ControlGroup>
      )}
      {showCompass && (
        <ControlGroup>
          <CompassButton onClick={handleResetBearing} />
        </ControlGroup>
      )}
      {showPitch && (
        <ControlGroup>
          <ControlButton onClick={handlePitchUp} label="Tilt up">
            <ChevronUp className="size-4" />
          </ControlButton>
          <ControlButton onClick={handlePitchDown} label="Tilt down">
            <ChevronDown className="size-4" />
          </ControlButton>
        </ControlGroup>
      )}
      {showLocate && (
        <ControlGroup>
          <ControlButton
            onClick={handleLocate}
            label="Find my location"
            disabled={waitingForLocation}
          >
            {waitingForLocation ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Locate className="size-4" />
            )}
          </ControlButton>
        </ControlGroup>
      )}
      {showFullscreen && (
        <ControlGroup>
          <ControlButton onClick={handleFullscreen} label="Toggle fullscreen">
            <Maximize className="size-4" />
          </ControlButton>
        </ControlGroup>
      )}
    </div>
  );
}

function CompassButton({ onClick }: { onClick: () => void }) {
  const { map } = useMap();
  const compassRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!map || !compassRef.current) return;

    const compass = compassRef.current;

    const updateRotation = () => {
      const bearing = map.getBearing();
      const pitch = map.getPitch();
      compass.style.transform = `rotateX(${pitch}deg) rotateZ(${-bearing}deg)`;
    };

    map.on("rotate", updateRotation);
    map.on("pitch", updateRotation);
    updateRotation();

    return () => {
      map.off("rotate", updateRotation);
      map.off("pitch", updateRotation);
    };
  }, [map]);

  return (
    <ControlButton onClick={onClick} label="Reset bearing to north">
      <svg
        ref={compassRef}
        viewBox="0 0 24 24"
        className="size-5"
        style={{ transformStyle: "preserve-3d" }}
      >
        <path d="M12 2L16 12H12V2Z" className="fill-red-500" />
        <path d="M12 2L8 12H12V2Z" className="fill-red-300" />
        <path d="M12 22L16 12H12V22Z" className="fill-muted-foreground/60" />
        <path d="M12 22L8 12H12V22Z" className="fill-muted-foreground/30" />
      </svg>
    </ControlButton>
  );
}

type MapPopupProps = {
  /** Longitude coordinate for popup position */
  longitude: number;
  /** Latitude coordinate for popup position */
  latitude: number;
  /** Callback when popup is closed */
  onClose?: () => void;
  /** Popup content */
  children: ReactNode;
  /** Additional CSS classes for the popup container */
  className?: string;
  /** Show a close button in the popup (default: false) */
  closeButton?: boolean;
} & Omit<PopupOptions, "className" | "closeButton">;

function MapPopup({
  longitude,
  latitude,
  onClose,
  children,
  className,
  closeButton = false,
  ...popupOptions
}: MapPopupProps) {
  const handleClose = useCallback(() => onClose?.(), [onClose]);

  return (
    <ReactMapLibrePopup
      longitude={longitude}
      latitude={latitude}
      offset={16}
      {...popupOptions}
      maxWidth={popupOptions.maxWidth ?? "none"}
      closeButton={false}
      onClose={handleClose}
    >
      <div
        className={cn(
          "bg-popover text-popover-foreground relative max-w-62 rounded-md border p-3 shadow-md",
          "animate-in fade-in-0 zoom-in-95 duration-200 ease-out",
          className,
        )}
      >
        {closeButton && <PopupCloseButton onClick={handleClose} />}
        {children}
      </div>
    </ReactMapLibrePopup>
  );
}

/** Imperative handle for `MapRoute` — layer/source ids for `beforeId` targeting. */
type MapRouteHandle = {
  /** MapLibre source id backing the route. */
  sourceId: string;
  /** MapLibre layer id for the route line. Pass to another layer's `beforeId` to stack it underneath this one. */
  layerId: string;
};

type MapRouteProps = {
  /** Optional unique identifier for the route layer */
  id?: string;
  /** Array of [longitude, latitude] coordinate pairs defining the route */
  coordinates: [number, number][];
  /** Line color as CSS color value (default: "#4285F4") */
  color?: string;
  /** Line width in pixels (default: 3) */
  width?: number;
  /** Line opacity from 0 to 1 (default: 0.8) */
  opacity?: number;
  /** Dash pattern [dash length, gap length] for dashed lines */
  dashArray?: [number, number];
  /** Callback when the route line is clicked */
  onClick?: () => void;
  /** Callback when mouse enters the route line */
  onMouseEnter?: () => void;
  /** Callback when mouse leaves the route line */
  onMouseLeave?: () => void;
  /** Whether the route is interactive - shows pointer cursor on hover (default: true) */
  interactive?: boolean;
  /** Optional MapLibre layer id to insert the route layer before (z-order control). */
  beforeId?: string;
  /** Exposes `{ sourceId, layerId }` — read `layerId` to pass to another layer's `beforeId`. */
  ref?: Ref<MapRouteHandle>;
};

function MapRoute({
  id: propId,
  coordinates,
  color = "#4285F4",
  width = 3,
  opacity = 0.8,
  dashArray,
  onClick,
  onMouseEnter,
  onMouseLeave,
  interactive = true,
  beforeId,
  ref,
}: MapRouteProps) {
  const { map } = useMap();
  const autoId = useId();
  const id = propId ?? autoId;
  const sourceId = `route-source-${id}`;
  const layerId = `route-layer-${id}`;

  useImperativeHandle(ref, () => ({ sourceId, layerId }), [sourceId, layerId]);

  const geoJSON = useMemo<GeoJSON.Feature<GeoJSON.LineString>>(
    () => ({
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: coordinates.length >= 2 ? coordinates : [],
      },
    }),
    [coordinates],
  );

  const paint = useMemo(
    () => ({
      "line-color": color,
      "line-width": width,
      "line-opacity": opacity,
      ...(dashArray && { "line-dasharray": dashArray }),
    }),
    [color, width, opacity, dashArray],
  );

  // <Layer> has no built-in interaction props, so click/hover are bound
  // directly to the map, filtered by layer id.
  useEffect(() => {
    if (!map || !interactive) return;

    const handleClick = () => onClick?.();
    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = "pointer";
      onMouseEnter?.();
    };
    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = "";
      onMouseLeave?.();
    };

    map.on("click", layerId, handleClick);
    map.on("mouseenter", layerId, handleMouseEnter);
    map.on("mouseleave", layerId, handleMouseLeave);

    return () => {
      map.off("click", layerId, handleClick);
      map.off("mouseenter", layerId, handleMouseEnter);
      map.off("mouseleave", layerId, handleMouseLeave);
    };
  }, [map, layerId, interactive, onClick, onMouseEnter, onMouseLeave]);

  return (
    <Source id={sourceId} type="geojson" data={geoJSON}>
      <Layer
        id={layerId}
        type="line"
        layout={{ "line-join": "round", "line-cap": "round" }}
        paint={paint}
        beforeId={beforeId}
      />
    </Source>
  );
}

type MapRasterPaint = NonNullable<MapLibreGL.RasterLayerSpecification["paint"]>;

type MapCogColorRamp = {
  /** Built-in ColorBrewer/CARTOColors ramp name (e.g. "BrewerSpectral9", "CartoEarth"). */
  scheme: string;
  /** Value mapped to the start of the ramp. */
  min: number;
  /** Value mapped to the end of the ramp. */
  max: number;
  /** Interpolate continuously between colors instead of discrete steps (default: false) */
  continuous?: boolean;
  /** Reverse the ramp direction (default: false) */
  reverse?: boolean;
};

type MapCogUrlOptions =
  | { dem?: false; colorRamp?: undefined }
  | { dem: true; colorRamp?: undefined }
  | { dem?: false; colorRamp: MapCogColorRamp };

/**
 * Builds a `cog://` URL for reading a Cloud Optimized GeoTIFF directly from
 * cloud storage — no tiling server, HTTP range requests decoded in the
 * browser via `@geomatico/maplibre-cog-protocol` (its protocol is registered
 * automatically when this module loads). Pass the result as the `url` prop:
 *
 * - Imagery: `<MapRasterLayer url={cogUrl(tifUrl)} tileSize={256} />`
 * - Single-band color ramp: `<MapRasterLayer url={cogUrl(tifUrl, { colorRamp: { scheme: "BrewerSpectral9", min: 0, max: 100 } })} tileSize={256} />`
 * - Elevation (hillshade or 3D terrain): `<MapHillshade url={cogUrl(demUrl, { dem: true })} tileSize={256} />`
 *
 * The COG must be in EPSG:3857; reprojection isn't supported by the protocol.
 */
function cogUrl(url: string, options?: MapCogUrlOptions): string {
  if (options?.dem) return `cog://${url}#dem`;
  if (options?.colorRamp) {
    const { scheme, min, max, continuous, reverse } = options.colorRamp;
    const modifiers = `${continuous ? "c" : ""}${reverse ? "-" : ""}`;
    return `cog://${url}#color:${scheme},${min},${max}${modifiers ? `,${modifiers}` : ""}`;
  }
  return `cog://${url}`;
}

/** Imperative handle for `MapRasterLayer` — layer/source ids for `beforeId` targeting. */
type MapRasterLayerHandle = {
  /** MapLibre source id backing the raster layer. */
  sourceId: string;
  /** MapLibre layer id. Pass to another layer's `beforeId` to stack it underneath this one. */
  layerId: string;
};

type MapRasterLayerProps = {
  /** Optional unique identifier prefix for the source/layer. Auto-generated if not provided. */
  id?: string;
  /** XYZ/TMS tile URL templates, e.g. `["https://.../{z}/{x}/{y}.png"]`. Provide this or `url`, not both. */
  tiles?: string[];
  /** URL to a TileJSON resource describing the raster tile source. Provide this or `tiles`, not both. */
  url?: string;
  /** Tile size in pixels (default: 256) */
  tileSize?: number;
  /** [west, south, east, north] bounds restricting where tiles are requested */
  bounds?: [number, number, number, number];
  /** Minimum zoom level for which tiles are available */
  minzoom?: number;
  /** Maximum zoom level for which tiles are available */
  maxzoom?: number;
  /** Layer opacity from 0 to 1 (default: 1) */
  opacity?: number;
  /** Additional MapLibre raster paint properties, merged on top of `opacity`. */
  paint?: MapRasterPaint;
  /** Optional MapLibre layer id to insert the layer before (z-order control). */
  beforeId?: string;
  /** Exposes `{ sourceId, layerId }` — read `layerId` to pass to another layer's `beforeId`. */
  ref?: Ref<MapRasterLayerHandle>;
};

/**
 * Renders a raster tile source (XYZ/TMS tiles or a TileJSON URL) as a raster
 * layer — satellite basemaps, weather overlays, NDVI tiles, etc. Composes
 * like `MapRoute` / `MapGeoJSON` — drop it inside `<Map>` (typically with
 * `blank`) to layer imagery on top of your own data.
 */
function MapRasterLayer({
  id: propId,
  tiles,
  url,
  tileSize = 256,
  bounds,
  minzoom,
  maxzoom,
  opacity = 1,
  paint,
  beforeId,
  ref,
}: MapRasterLayerProps) {
  const autoId = useId();
  const id = propId ?? autoId;
  const sourceId = `raster-source-${id}`;
  const layerId = `raster-layer-${id}`;

  useImperativeHandle(ref, () => ({ sourceId, layerId }), [sourceId, layerId]);

  const mergedPaint = useMemo<MapRasterPaint>(
    () => ({ "raster-opacity": opacity, ...(paint || {}) }),
    [opacity, paint],
  );

  return (
    <Source
      id={sourceId}
      type="raster"
      tileSize={tileSize}
      {...(tiles ? { tiles } : { url })}
      {...(bounds ? { bounds } : {})}
      {...(minzoom !== undefined ? { minzoom } : {})}
      {...(maxzoom !== undefined ? { maxzoom } : {})}
    >
      <Layer id={layerId} type="raster" paint={mergedPaint} beforeId={beforeId} />
    </Source>
  );
}

type MapHillshadePaint = NonNullable<
  MapLibreGL.HillshadeLayerSpecification["paint"]
>;

/** Imperative handle for `MapHillshade` — layer/source ids for `beforeId` targeting. */
type MapHillshadeHandle = {
  /** MapLibre source id backing the hillshade layer. */
  sourceId: string;
  /** MapLibre layer id. Pass to another layer's `beforeId` to stack it underneath this one. */
  layerId: string;
};

type MapHillshadeProps = {
  /** Optional unique identifier prefix for the source/layer. Auto-generated if not provided. */
  id?: string;
  /** XYZ/TMS elevation tile URL templates. Provide this or `url`, not both. */
  tiles?: string[];
  /** URL to a TileJSON resource describing the raster-dem source. Provide this or `tiles`, not both. */
  url?: string;
  /** Tile size in pixels (default: 256) */
  tileSize?: number;
  /** Elevation tile encoding (default: "mapbox") */
  encoding?: "terrarium" | "mapbox" | "custom";
  /** MapLibre hillshade paint properties (illumination direction/color, exaggeration, etc.) */
  paint?: MapHillshadePaint;
  /** Optional MapLibre layer id to insert the layer before (z-order control). */
  beforeId?: string;
  /** Exposes `{ sourceId, layerId }` — read `layerId` to pass to another layer's `beforeId`. */
  ref?: Ref<MapHillshadeHandle>;
};

/**
 * Renders a raster-dem elevation source as a 2D shaded-relief (`hillshade`)
 * layer. For 3D terrain exaggeration instead, use `MapTerrain`.
 */
function MapHillshade({
  id: propId,
  tiles,
  url,
  tileSize = 256,
  encoding = "mapbox",
  paint,
  beforeId,
  ref,
}: MapHillshadeProps) {
  const autoId = useId();
  const id = propId ?? autoId;
  const sourceId = `hillshade-source-${id}`;
  const layerId = `hillshade-layer-${id}`;

  useImperativeHandle(ref, () => ({ sourceId, layerId }), [sourceId, layerId]);

  return (
    <Source
      id={sourceId}
      type="raster-dem"
      tileSize={tileSize}
      encoding={encoding}
      {...(tiles ? { tiles } : { url })}
    >
      <Layer id={layerId} type="hillshade" paint={paint} beforeId={beforeId} />
    </Source>
  );
}

type MapTerrainProps = {
  /** Optional unique identifier prefix for the source. Auto-generated if not provided. */
  id?: string;
  /** XYZ/TMS elevation tile URL templates. Provide this or `url`, not both. */
  tiles?: string[];
  /** URL to a TileJSON resource describing the raster-dem source. Provide this or `tiles`, not both. */
  url?: string;
  /** Tile size in pixels (default: 256) */
  tileSize?: number;
  /** Elevation tile encoding (default: "mapbox") */
  encoding?: "terrarium" | "mapbox" | "custom";
  /** How high the terrain looks; higher values exaggerate elevation (default: 1) */
  exaggeration?: number;
};

/**
 * Enables 3D terrain by registering a raster-dem elevation source and pointing
 * the map's terrain at it (`map.setTerrain`). Unlike the other layer
 * components this configures the whole map, not a layer — mount at most one
 * at a time. Reapplies itself across theme-driven style reloads, since
 * `setStyle` clears terrain along with the rest of the style.
 */
function MapTerrain({
  id: propId,
  tiles,
  url,
  tileSize = 256,
  encoding = "mapbox",
  exaggeration = 1,
}: MapTerrainProps) {
  const { map } = useMap();
  const autoId = useId();
  const id = propId ?? autoId;
  const sourceId = `terrain-source-${id}`;

  useEffect(() => {
    if (!map) return;

    const applyTerrain = () => {
      if (map.getSource(sourceId)) {
        map.setTerrain({ source: sourceId, exaggeration });
      }
    };

    applyTerrain();
    map.on("styledata", applyTerrain);

    return () => {
      map.off("styledata", applyTerrain);
      if (map.style && map.getTerrain()?.source === sourceId) {
        map.setTerrain(null);
      }
    };
  }, [map, sourceId, exaggeration]);

  return (
    <Source
      id={sourceId}
      type="raster-dem"
      tileSize={tileSize}
      encoding={encoding}
      {...(tiles ? { tiles } : { url })}
    />
  );
}

type MapGeoJSONData<
  P extends GeoJSON.GeoJsonProperties = GeoJSON.GeoJsonProperties,
> =
  | GeoJSON.FeatureCollection<GeoJSON.Geometry, P>
  | GeoJSON.Feature<GeoJSON.Geometry, P>
  | GeoJSON.Geometry
  | string;

type MapFillPaint = NonNullable<MapLibreGL.FillLayerSpecification["paint"]>;
type MapLinePaint = NonNullable<MapLibreGL.LineLayerSpecification["paint"]>;

/** A rendered feature with strongly-typed `properties`. */
type MapGeoJSONFeature<
  P extends GeoJSON.GeoJsonProperties = GeoJSON.GeoJsonProperties,
> = Omit<MapLibreGL.MapGeoJSONFeature, "properties"> & { properties: P };

/** Event payload passed to MapGeoJSON interaction callbacks. */
type MapGeoJSONEvent<
  P extends GeoJSON.GeoJsonProperties = GeoJSON.GeoJsonProperties,
> = {
  /** The feature under the cursor, with its typed GeoJSON properties. */
  feature: MapGeoJSONFeature<P>;
  /** Longitude of the cursor at the time of the event. */
  longitude: number;
  /** Latitude of the cursor at the time of the event. */
  latitude: number;
  /** The underlying MapLibre mouse event for advanced use cases. */
  originalEvent: MapLibreGL.MapLayerMouseEvent;
};

/** Imperative handle for `MapGeoJSON` — layer/source ids for `beforeId` targeting. */
type MapGeoJSONHandle = {
  /** MapLibre source id backing the fill/line layers. */
  sourceId: string;
  /** MapLibre layer id for the fill layer (absent when `fillPaint={false}`). Pass to another layer's `beforeId` to stack it underneath. */
  fillLayerId: string;
  /** MapLibre layer id for the outline layer (absent when `linePaint={false}`). Pass to another layer's `beforeId` to stack it underneath. */
  lineLayerId: string;
};

type MapGeoJSONProps<
  P extends GeoJSON.GeoJsonProperties = GeoJSON.GeoJsonProperties,
> = {
  /** GeoJSON data (FeatureCollection, Feature, Geometry) or a URL to fetch it from. */
  data: MapGeoJSONData<P>;
  /** Optional unique identifier prefix for the source/layers. Auto-generated if not provided. */
  id?: string;
  /**
   * Feature property to promote to the feature `id`. Required for hover
   * feature-state (`fillHoverPaint`) and stable `onHover`/`onClick` payloads.
   */
  promoteId?: string;
  /**
   * Paint for the polygon fill layer. Merged on top of a theme-aware monochrome
   * surface tone (`fill-color`). Pass `false` to omit the fill layer entirely
   * (e.g. outlines only).
   */
  fillPaint?: MapFillPaint | false;
  /**
   * Paint for the outline layer. Merged on top of a hairline default
   * (`line-color` = a near-surface neutral, `line-width` = 0.5) for thin
   * separators. Override `line-color` if your container differs, or pass
   * `false` to omit the layer.
   */
  linePaint?: MapLinePaint | false;
  /**
   * Paint merged onto the fill layer for the feature under the cursor, applied
   * as a `case` expression keyed on hover feature-state. Requires `promoteId`.
   */
  fillHoverPaint?: MapFillPaint;
  /** Callback when a feature is clicked. */
  onClick?: (e: MapGeoJSONEvent<P>) => void;
  /** Callback fired when the hovered feature changes; `null` when the cursor leaves. */
  onHover?: (e: MapGeoJSONEvent<P> | null) => void;
  /** Whether features respond to mouse events (default: false). */
  interactive?: boolean;
  /** Optional MapLibre layer id to insert the layers before (z-order control). */
  beforeId?: string;
  /** Exposes `{ sourceId, fillLayerId, lineLayerId }` — read a layer id to pass to another layer's `beforeId`. */
  ref?: Ref<MapGeoJSONHandle>;
};

// Monochrome defaults: a neutral-gray fill (hex of the grayscale chart tokens)
// with a fixed near-surface line for thin separators. Colors are hardcoded (not
// theme tokens), tuned for a typical light/dark surface. Override via
// `fillPaint` / `linePaint`.
const GEOJSON_DEFAULT_COLORS = {
  light: { fill: "#d4d4d4", line: "#ffffff" },
  dark: { fill: "#404040", line: "#171717" },
} satisfies Record<Theme, { fill: string; line: string }>;

/**
 * Renders arbitrary GeoJSON as fill + outline layers on the map. Composes like
 * `MapRoute` / `MapArc` — drop it inside `<Map>` (typically with `blank`) for
 * choropleths and region/data maps. For full control over expressions and
 * multiple layers, manage layers directly via `useMap()` instead.
 */
function MapGeoJSON<
  P extends GeoJSON.GeoJsonProperties = GeoJSON.GeoJsonProperties,
>({
  data,
  id: propId,
  promoteId,
  fillPaint,
  linePaint,
  fillHoverPaint,
  onClick,
  onHover,
  interactive = false,
  beforeId,
  ref,
}: MapGeoJSONProps<P>) {
  const { map, resolvedTheme } = useMap();
  const autoId = useId();
  const id = propId ?? autoId;
  const sourceId = `geojson-source-${id}`;
  const fillLayerId = `geojson-fill-${id}`;
  const lineLayerId = `geojson-line-${id}`;

  useImperativeHandle(
    ref,
    () => ({ sourceId, fillLayerId, lineLayerId }),
    [sourceId, fillLayerId, lineLayerId],
  );

  const defaults = GEOJSON_DEFAULT_COLORS[resolvedTheme];

  const showFill = fillPaint !== false;
  const showLine = linePaint !== false;

  const mergedFillPaint = useMemo(
    () =>
      mergeHoverPaint(
        { "fill-color": defaults.fill, ...(fillPaint || {}) },
        fillHoverPaint,
      ),
    [defaults.fill, fillPaint, fillHoverPaint],
  );
  const mergedLinePaint = useMemo(
    () => ({
      "line-color": defaults.line,
      "line-width": 0.5,
      ...(linePaint || {}),
    }),
    [defaults.line, linePaint],
  );
  const latestRef = useRef({ onClick, onHover });
  latestRef.current = { onClick, onHover };

  // Interaction + hover feature-state handlers (bound to the fill layer).
  // <Layer> has no interaction props, so this stays imperative on the raw map.
  useEffect(() => {
    if (!map || !interactive || !showFill) return;

    let hoveredId: string | number | null = null;

    const setHover = (next: string | number | null) => {
      if (next === hoveredId) return;
      const sourceExists = !!map.getSource(sourceId);
      if (hoveredId != null && sourceExists) {
        map.setFeatureState(
          { source: sourceId, id: hoveredId },
          { hover: false },
        );
      }
      hoveredId = next;
      if (next != null && sourceExists) {
        map.setFeatureState({ source: sourceId, id: next }, { hover: true });
      }
    };

    const handleMouseMove = (e: MapLibreGL.MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature) return;
      map.getCanvas().style.cursor = "pointer";

      const featureId = feature.id;
      if (featureId === hoveredId) return;
      setHover(featureId ?? null);
      latestRef.current.onHover?.({
        feature: feature as unknown as MapGeoJSONFeature<P>,
        longitude: e.lngLat.lng,
        latitude: e.lngLat.lat,
        originalEvent: e,
      });
    };

    const handleMouseLeave = () => {
      setHover(null);
      map.getCanvas().style.cursor = "";
      latestRef.current.onHover?.(null);
    };

    const handleClick = (e: MapLibreGL.MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature) return;
      latestRef.current.onClick?.({
        feature: feature as unknown as MapGeoJSONFeature<P>,
        longitude: e.lngLat.lng,
        latitude: e.lngLat.lat,
        originalEvent: e,
      });
    };

    map.on("mousemove", fillLayerId, handleMouseMove);
    map.on("mouseleave", fillLayerId, handleMouseLeave);
    map.on("click", fillLayerId, handleClick);

    return () => {
      map.off("mousemove", fillLayerId, handleMouseMove);
      map.off("mouseleave", fillLayerId, handleMouseLeave);
      map.off("click", fillLayerId, handleClick);
      setHover(null);
      map.getCanvas().style.cursor = "";
    };
  }, [map, fillLayerId, sourceId, interactive, showFill]);

  return (
    <Source
      id={sourceId}
      type="geojson"
      data={data as GeoJSON.GeoJSON}
      {...(promoteId ? { promoteId } : {})}
    >
      {showFill && (
        <Layer
          id={fillLayerId}
          type="fill"
          paint={mergedFillPaint}
          beforeId={beforeId}
        />
      )}
      {showLine && (
        <Layer
          id={lineLayerId}
          type="line"
          paint={mergedLinePaint}
          beforeId={beforeId}
        />
      )}
    </Source>
  );
}

/** A single arc to render inside <MapArc data={...}>. */
type MapArcDatum = {
  /** Unique identifier for this arc. Required for hover state tracking and event payloads. */
  id: string | number;
  /** Start coordinate as [longitude, latitude]. */
  from: [number, number];
  /** End coordinate as [longitude, latitude]. */
  to: [number, number];
};

/** Event payload passed to MapArc interaction callbacks. */
type MapArcEvent<T extends MapArcDatum = MapArcDatum> = {
  /** The arc datum that was hovered or clicked. */
  arc: T;
  /** Longitude of the cursor at the time of the event. */
  longitude: number;
  /** Latitude of the cursor at the time of the event. */
  latitude: number;
  /** The underlying MapLibre mouse event for advanced use cases. */
  originalEvent: MapLibreGL.MapMouseEvent;
};

type MapArcLinePaint = NonNullable<MapLibreGL.LineLayerSpecification["paint"]>;
type MapArcLineLayout = NonNullable<
  MapLibreGL.LineLayerSpecification["layout"]
>;

/** Imperative handle for `MapArc` — layer/source ids for `beforeId` targeting. */
type MapArcHandle = {
  /** MapLibre source id backing the arc layers. */
  sourceId: string;
  /** MapLibre layer id for the visible arc line. Pass to another layer's `beforeId` to stack it underneath. */
  layerId: string;
  /** MapLibre layer id for the invisible wide hit-testing line beneath the visible arc. */
  hitLayerId: string;
};

type MapArcProps<T extends MapArcDatum = MapArcDatum> = {
  /** Array of arcs to render. Each arc must have a unique `id`. */
  data: T[];
  /** Optional unique identifier prefix for the arc source/layers. Auto-generated if not provided. */
  id?: string;
  /**
   * How far each arc bows away from a straight line. `0` renders straight
   * lines; higher values bend further. Negative values bend to the opposite
   * side. Arcs are computed as a quadratic Bézier in lng/lat space; the
   * destination longitude is unwrapped relative to the origin so that arcs
   * cross the antimeridian via the shorter great-circle direction. (default: 0.2)
   */
  curvature?: number;
  /** Number of samples used to render each curve. Higher = smoother. (default: 64) */
  samples?: number;
  /**
   * MapLibre paint properties for the arc layer. Merged on top of sensible
   * defaults (`line-color: #4285F4`, `line-width: 2`, `line-opacity: 0.85`).
   * Any value can be a MapLibre expression for per-feature styling, every
   * field on each arc datum (besides `from`/`to`) is exposed via `["get", ...]`.
   */
  paint?: MapArcLinePaint;
  /** MapLibre layout properties for the arc layer. Defaults to rounded joins/caps. */
  layout?: MapArcLineLayout;
  /**
   * Paint properties applied to the arc currently under the cursor. Each key
   * is merged into `paint` as a `case` expression keyed on per-feature hover
   * state, so only the hovered arc changes appearance.
   */
  hoverPaint?: MapArcLinePaint;
  /** Callback when an arc is clicked. */
  onClick?: (e: MapArcEvent<T>) => void;
  /**
   * Callback fired when the hovered arc changes. Receives the cursor's
   * lng/lat at the moment of entry, and `null` when the cursor leaves the
   * last hovered arc.
   */
  onHover?: (e: MapArcEvent<T> | null) => void;
  /** Whether arcs respond to mouse events (default: true). */
  interactive?: boolean;
  /** Optional MapLibre layer id to insert the arc layers before (z-order control). */
  beforeId?: string;
  /** Exposes `{ sourceId, layerId, hitLayerId }` — read `layerId` to pass to another layer's `beforeId`. */
  ref?: Ref<MapArcHandle>;
};

const DEFAULT_ARC_CURVATURE = 0.2;
const DEFAULT_ARC_SAMPLES = 64;
const ARC_HIT_MIN_WIDTH = 12;
const ARC_HIT_PADDING = 6;

const DEFAULT_ARC_PAINT: MapArcLinePaint = {
  "line-color": "#4285F4",
  "line-width": 2,
  "line-opacity": 0.85,
};

const DEFAULT_ARC_LAYOUT: MapArcLineLayout = {
  "line-join": "round",
  "line-cap": "round",
};

function buildArcCoordinates(
  from: [number, number],
  to: [number, number],
  curvature: number,
  samples: number,
): [number, number][] {
  const [x0, y0] = from;
  const [xTo, y2] = to;
  // Unwrap the destination longitude so |dx| <= 180. This makes arcs that
  // straddle the antimeridian (e.g. Tokyo -> San Francisco) bow the short way
  // across the Pacific instead of the long way around the globe. Resulting
  // longitudes may fall outside [-180, 180]; MapLibre renders them correctly
  // on the globe projection, and on mercator when world copies are enabled.
  const rawDx = xTo - x0;
  const x2 = rawDx > 180 ? xTo - 360 : rawDx < -180 ? xTo + 360 : xTo;
  const dx = x2 - x0;
  const dy = y2 - y0;
  const distance = Math.hypot(dx, dy);

  if (distance === 0 || curvature === 0) return [from, [x2, y2]];

  const mx = (x0 + x2) / 2;
  const my = (y0 + y2) / 2;
  const nx = -dy / distance;
  const ny = dx / distance;
  const offset = distance * curvature;
  const cx = mx + nx * offset;
  const cy = my + ny * offset;

  const points: [number, number][] = [];
  const segments = Math.max(2, Math.floor(samples));
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const inv = 1 - t;
    const x = inv * inv * x0 + 2 * inv * t * cx + t * t * x2;
    const y = inv * inv * y0 + 2 * inv * t * cy + t * t * y2;
    points.push([x, y]);
  }
  return points;
}

function MapArc<T extends MapArcDatum = MapArcDatum>({
  data,
  id: propId,
  curvature = DEFAULT_ARC_CURVATURE,
  samples = DEFAULT_ARC_SAMPLES,
  paint,
  layout,
  hoverPaint,
  onClick,
  onHover,
  interactive = true,
  beforeId,
  ref,
}: MapArcProps<T>) {
  const { map } = useMap();
  const autoId = useId();
  const id = propId ?? autoId;
  const sourceId = `arc-source-${id}`;
  const layerId = `arc-layer-${id}`;
  const hitLayerId = `arc-hit-layer-${id}`;

  useImperativeHandle(
    ref,
    () => ({ sourceId, layerId, hitLayerId }),
    [sourceId, layerId, hitLayerId],
  );

  const mergedPaint = useMemo(
    () => mergeHoverPaint({ ...DEFAULT_ARC_PAINT, ...paint }, hoverPaint),
    [paint, hoverPaint],
  );
  const mergedLayout = useMemo(
    () => ({ ...DEFAULT_ARC_LAYOUT, ...layout }),
    [layout],
  );

  const hitWidth = useMemo(() => {
    const w = paint?.["line-width"] ?? DEFAULT_ARC_PAINT["line-width"];
    const base = typeof w === "number" ? w : ARC_HIT_MIN_WIDTH;
    return Math.max(base + ARC_HIT_PADDING, ARC_HIT_MIN_WIDTH);
  }, [paint]);

  const hitPaint = useMemo(
    () => ({
      "line-color": "rgba(0, 0, 0, 0)",
      "line-width": hitWidth,
      "line-opacity": 1,
    }),
    [hitWidth],
  );

  const geoJSON = useMemo<GeoJSON.FeatureCollection<GeoJSON.LineString>>(
    () => ({
      type: "FeatureCollection",
      features: data.map((arc) => {
        const { from, to, ...properties } = arc;
        return {
          type: "Feature",
          properties,
          geometry: {
            type: "LineString",
            coordinates: buildArcCoordinates(from, to, curvature, samples),
          },
        };
      }),
    }),
    [data, curvature, samples],
  );

  const latestRef = useRef({ data, onClick, onHover });
  latestRef.current = { data, onClick, onHover };

  // Interaction handlers (bound to the invisible wide hit layer).
  useEffect(() => {
    if (!map || !interactive) return;

    let hoveredId: string | number | null = null;

    const setHover = (next: string | number | null) => {
      if (next === hoveredId) return;
      const sourceExists = !!map.getSource(sourceId);
      if (hoveredId != null && sourceExists) {
        map.setFeatureState(
          { source: sourceId, id: hoveredId },
          { hover: false },
        );
      }
      hoveredId = next;
      if (next != null && sourceExists) {
        map.setFeatureState({ source: sourceId, id: next }, { hover: true });
      }
    };

    const findArc = (featureId: string | number | undefined) =>
      featureId == null
        ? undefined
        : latestRef.current.data.find(
            (arc) => String(arc.id) === String(featureId),
          );

    const handleMouseMove = (e: MapLibreGL.MapLayerMouseEvent) => {
      const featureId = e.features?.[0]?.id as string | number | undefined;
      if (featureId == null || featureId === hoveredId) return;

      setHover(featureId);
      map.getCanvas().style.cursor = "pointer";

      const arc = findArc(featureId);
      if (arc) {
        latestRef.current.onHover?.({
          arc: arc as T,
          longitude: e.lngLat.lng,
          latitude: e.lngLat.lat,
          originalEvent: e,
        });
      }
    };

    const handleMouseLeave = () => {
      setHover(null);
      map.getCanvas().style.cursor = "";
      latestRef.current.onHover?.(null);
    };

    const handleClick = (e: MapLibreGL.MapLayerMouseEvent) => {
      const arc = findArc(e.features?.[0]?.id as string | number | undefined);
      if (!arc) return;
      latestRef.current.onClick?.({
        arc: arc as T,
        longitude: e.lngLat.lng,
        latitude: e.lngLat.lat,
        originalEvent: e,
      });
    };

    map.on("mousemove", hitLayerId, handleMouseMove);
    map.on("mouseleave", hitLayerId, handleMouseLeave);
    map.on("click", hitLayerId, handleClick);

    return () => {
      map.off("mousemove", hitLayerId, handleMouseMove);
      map.off("mouseleave", hitLayerId, handleMouseLeave);
      map.off("click", hitLayerId, handleClick);
      setHover(null);
      map.getCanvas().style.cursor = "";
    };
  }, [map, hitLayerId, sourceId, interactive]);

  return (
    <Source id={sourceId} type="geojson" data={geoJSON} promoteId="id">
      <Layer
        id={hitLayerId}
        type="line"
        layout={DEFAULT_ARC_LAYOUT}
        paint={hitPaint}
        beforeId={beforeId}
      />
      <Layer
        id={layerId}
        type="line"
        layout={mergedLayout}
        paint={mergedPaint}
        beforeId={beforeId}
      />
    </Source>
  );
}

/** Imperative handle for `MapClusterLayer` — layer/source ids for `beforeId` targeting. */
type MapClusterLayerHandle = {
  /** MapLibre source id backing all three layers. */
  sourceId: string;
  /** MapLibre layer id for the cluster circles. */
  clusterLayerId: string;
  /** MapLibre layer id for the cluster point-count labels. */
  clusterCountLayerId: string;
  /** MapLibre layer id for individual (unclustered) points. Pass any of these to another layer's `beforeId` to stack it underneath. */
  unclusteredLayerId: string;
};

type MapClusterLayerProps<
  P extends GeoJSON.GeoJsonProperties = GeoJSON.GeoJsonProperties,
> = {
  /** GeoJSON FeatureCollection data or URL to fetch GeoJSON from */
  data: string | GeoJSON.FeatureCollection<GeoJSON.Point, P>;
  /** Maximum zoom level to cluster points on (default: 14) */
  clusterMaxZoom?: number;
  /** Radius of each cluster when clustering points in pixels (default: 50) */
  clusterRadius?: number;
  /** Colors for cluster circles: [small, medium, large] based on point count (default: ["#3b82f6", "#1d4ed8", "#1e3a8a"]) */
  clusterColors?: [string, string, string];
  /** Point count thresholds for color/size steps: [medium, large] (default: [100, 750]) */
  clusterThresholds?: [number, number];
  /** Color for unclustered individual points (default: "#3b82f6") */
  pointColor?: string;
  /** Callback when an unclustered point is clicked */
  onPointClick?: (
    feature: GeoJSON.Feature<GeoJSON.Point, P>,
    coordinates: [number, number],
  ) => void;
  /** Callback when a cluster is clicked. If not provided, zooms into the cluster */
  onClusterClick?: (
    clusterId: number,
    coordinates: [number, number],
    pointCount: number,
  ) => void;
  /** Optional MapLibre layer id to insert the cluster layers before (z-order control). */
  beforeId?: string;
  /** Exposes `{ sourceId, clusterLayerId, clusterCountLayerId, unclusteredLayerId }` — read a layer id to pass to another layer's `beforeId`. */
  ref?: Ref<MapClusterLayerHandle>;
};

const DEFAULT_CLUSTER_COLORS: [string, string, string] = [
  "#3b82f6",
  "#1d4ed8",
  "#1e3a8a",
];
const DEFAULT_CLUSTER_THRESHOLDS: [number, number] = [100, 750];

type MapCirclePaint = NonNullable<MapLibreGL.CircleLayerSpecification["paint"]>;

function MapClusterLayer<
  P extends GeoJSON.GeoJsonProperties = GeoJSON.GeoJsonProperties,
>({
  data,
  clusterMaxZoom = 14,
  clusterRadius = 50,
  clusterColors = DEFAULT_CLUSTER_COLORS,
  clusterThresholds = DEFAULT_CLUSTER_THRESHOLDS,
  pointColor = "#3b82f6",
  onPointClick,
  onClusterClick,
  beforeId,
  ref,
}: MapClusterLayerProps<P>) {
  const { map } = useMap();
  const id = useId();
  const sourceId = `cluster-source-${id}`;
  const clusterLayerId = `clusters-${id}`;
  const clusterCountLayerId = `cluster-count-${id}`;
  const unclusteredLayerId = `unclustered-point-${id}`;

  useImperativeHandle(
    ref,
    () => ({ sourceId, clusterLayerId, clusterCountLayerId, unclusteredLayerId }),
    [sourceId, clusterLayerId, clusterCountLayerId, unclusteredLayerId],
  );

  const clusterPaint = useMemo<MapCirclePaint>(
    () => ({
      "circle-color": [
        "step",
        ["get", "point_count"],
        clusterColors[0],
        clusterThresholds[0],
        clusterColors[1],
        clusterThresholds[1],
        clusterColors[2],
      ],
      "circle-radius": [
        "step",
        ["get", "point_count"],
        20,
        clusterThresholds[0],
        30,
        clusterThresholds[1],
        40,
      ],
      "circle-stroke-width": 0.75,
      "circle-stroke-color": "#fff",
      "circle-opacity": 0.85,
    }),
    [clusterColors, clusterThresholds],
  );

  const unclusteredPaint = useMemo<MapCirclePaint>(
    () => ({
      "circle-color": pointColor,
      "circle-radius": 5,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#fff",
    }),
    [pointColor],
  );

  // Click + cursor handlers. Cluster expansion zoom and point coordinates
  // still need the raw map/source APIs, so this stays imperative.
  useEffect(() => {
    if (!map) return;

    const handleClusterClick = async (
      e: MapLibreGL.MapMouseEvent & {
        features?: MapLibreGL.MapGeoJSONFeature[];
      },
    ) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: [clusterLayerId],
      });
      if (!features.length) return;

      const feature = features[0];
      const clusterId = feature.properties?.cluster_id as number;
      const pointCount = feature.properties?.point_count as number;
      const coordinates = (feature.geometry as GeoJSON.Point).coordinates as [
        number,
        number,
      ];

      if (onClusterClick) {
        onClusterClick(clusterId, coordinates, pointCount);
      } else {
        // Default behavior: zoom to cluster expansion zoom
        const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource;
        const zoom = await source.getClusterExpansionZoom(clusterId);
        map.easeTo({
          center: coordinates,
          zoom,
        });
      }
    };

    const handlePointClick = (
      e: MapLibreGL.MapMouseEvent & {
        features?: MapLibreGL.MapGeoJSONFeature[];
      },
    ) => {
      if (!onPointClick || !e.features?.length) return;

      const feature = e.features[0];
      const coordinates = (
        feature.geometry as GeoJSON.Point
      ).coordinates.slice() as [number, number];

      // Handle world copies
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      onPointClick(
        feature as unknown as GeoJSON.Feature<GeoJSON.Point, P>,
        coordinates,
      );
    };

    const handleMouseEnterCluster = () => {
      map.getCanvas().style.cursor = "pointer";
    };
    const handleMouseLeaveCluster = () => {
      map.getCanvas().style.cursor = "";
    };
    const handleMouseEnterPoint = () => {
      if (onPointClick) {
        map.getCanvas().style.cursor = "pointer";
      }
    };
    const handleMouseLeavePoint = () => {
      map.getCanvas().style.cursor = "";
    };

    map.on("click", clusterLayerId, handleClusterClick);
    map.on("click", unclusteredLayerId, handlePointClick);
    map.on("mouseenter", clusterLayerId, handleMouseEnterCluster);
    map.on("mouseleave", clusterLayerId, handleMouseLeaveCluster);
    map.on("mouseenter", unclusteredLayerId, handleMouseEnterPoint);
    map.on("mouseleave", unclusteredLayerId, handleMouseLeavePoint);

    return () => {
      map.off("click", clusterLayerId, handleClusterClick);
      map.off("click", unclusteredLayerId, handlePointClick);
      map.off("mouseenter", clusterLayerId, handleMouseEnterCluster);
      map.off("mouseleave", clusterLayerId, handleMouseLeaveCluster);
      map.off("mouseenter", unclusteredLayerId, handleMouseEnterPoint);
      map.off("mouseleave", unclusteredLayerId, handleMouseLeavePoint);
    };
  }, [
    map,
    clusterLayerId,
    unclusteredLayerId,
    sourceId,
    onClusterClick,
    onPointClick,
  ]);

  return (
    <Source
      id={sourceId}
      type="geojson"
      data={data}
      cluster
      clusterMaxZoom={clusterMaxZoom}
      clusterRadius={clusterRadius}
    >
      <Layer
        id={clusterLayerId}
        type="circle"
        filter={["has", "point_count"]}
        paint={clusterPaint}
        beforeId={beforeId}
      />
      <Layer
        id={clusterCountLayerId}
        type="symbol"
        filter={["has", "point_count"]}
        layout={{
          "text-field": "{point_count_abbreviated}",
          "text-font": ["Open Sans Semibold"],
          "text-size": 12,
        }}
        paint={{ "text-color": "#fff" }}
        beforeId={beforeId}
      />
      <Layer
        id={unclusteredLayerId}
        type="circle"
        filter={["!", ["has", "point_count"]]}
        paint={unclusteredPaint}
        beforeId={beforeId}
      />
    </Source>
  );
}

// Re-exports every underlying react-maplibre primitive (Marker, Popup,
// Source, Layer, the various controls, useControl, MapProvider, etc.) under
// a namespace so consumers can compose custom map pieces this file doesn't
// wrap, without colliding with this file's own Map/useMap/MapProps/MapRef.
export * as ReactMapLibre from "@vis.gl/react-maplibre";

export {
  Map,
  useMap,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MarkerTooltip,
  MarkerLabel,
  MapPopup,
  MapControls,
  MapRoute,
  MapRasterLayer,
  MapHillshade,
  MapTerrain,
  cogUrl,
  MapArc,
  MapGeoJSON,
  MapClusterLayer,
};

export type {
  MapRef,
  MapViewport,
  MapStyleOption,
  MapArcDatum,
  MapArcEvent,
  MapGeoJSONData,
  MapGeoJSONFeature,
  MapGeoJSONEvent,
  MapProps,
  MapMarkerProps,
  MarkerContentProps,
  MarkerPopupProps,
  MarkerTooltipProps,
  MarkerLabelProps,
  MapControlsProps,
  MapPopupProps,
  MapRouteProps,
  MapRouteHandle,
  MapRasterLayerProps,
  MapRasterLayerHandle,
  MapHillshadeProps,
  MapHillshadeHandle,
  MapTerrainProps,
  MapCogColorRamp,
  MapCogUrlOptions,
  MapArcProps,
  MapArcHandle,
  MapGeoJSONProps,
  MapGeoJSONHandle,
  MapClusterLayerProps,
  MapClusterLayerHandle,
};
