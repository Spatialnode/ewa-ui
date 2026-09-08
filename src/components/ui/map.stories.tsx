import type { Meta, StoryObj } from "@storybook/react-vite";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import type * as GeoJSON from "geojson";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Map,
  MapArc,
  MapClusterLayer,
  MapControls,
  MapGeoJSON,
  MapHillshade,
  MapMarker,
  MapPopup,
  MapRasterLayer,
  MapRoute,
  MapTerrain,
  MarkerContent,
  MarkerLabel,
  MarkerPopup,
  MarkerTooltip,
  cogUrl,
  useMap,
  type MapArcDatum,
  type MapClusterLayerHandle,
  type MapGeoJSONHandle,
  type MapRouteHandle,
} from "./map";

const meta = {
  title: "UI/Map",
  component: Map,
  subcomponents: {
    MapMarker,
    MarkerContent,
    MarkerLabel,
    MarkerTooltip,
    MarkerPopup,
    MapPopup,
    MapControls,
    MapRoute,
    MapRasterLayer,
    MapHillshade,
    MapTerrain,
    MapArc,
    MapGeoJSON,
    MapClusterLayer,
  },
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Map>;

export default meta;

type Story = StoryObj<typeof Map>;






function MapCanvas({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background h-[560px] w-full p-4">
      <div className="border-border h-full w-full overflow-hidden rounded-lg border">
        {children}
      </div>
    </div>
  );
}

// A small square polygon (roughly 350m across) around a center point, used to
// stand in for parcels / trade areas in the site-selection and multi-layer demos.
function squareAround(
  [lng, lat]: [number, number],
  size = 0.0035,
): GeoJSON.Position[] {
  return [
    [lng - size, lat - size],
    [lng + size, lat - size],
    [lng + size, lat + size],
    [lng - size, lat + size],
    [lng - size, lat - size],
  ];
}

// Deterministic PRNG (mulberry32) so demand-point scatter is stable across
// reloads and Chromatic snapshots instead of using Math.random().
function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildDemandPoints(
  count: number,
  [west, south, east, north]: [number, number, number, number],
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  const random = mulberry32(42);
  return {
    type: "FeatureCollection",
    features: Array.from({ length: count }, (_, i) => ({
      type: "Feature",
      properties: { id: i },
      geometry: {
        type: "Point",
        coordinates: [
          west + random() * (east - west),
          south + random() * (north - south),
        ],
      },
    })),
  };
}

// --- Story 1: route + business location -----------------------------------

const WAREHOUSE: [number, number] = [-122.3872, 37.7803];
const COFFEE_ROASTERY: [number, number] = [-122.3937, 37.7955];

const DELIVERY_ROUTE: [number, number][] = [
  WAREHOUSE,
  [-122.3915, 37.7845],
  [-122.3902, 37.7891],
  [-122.3928, 37.7932],
  COFFEE_ROASTERY,
];

export const RouteToBusinessLocation: Story = {
  name: "Route & business location",
  parameters: {
    docs: {
      description: {
        story:
          "A delivery route (`MapRoute`) between a warehouse and a business, with the destination as a `MapMarker` — click it to open its `MarkerPopup`.",
      },
    },
  },
  render: () => (
    <MapCanvas>
      <Map viewport={{ center: [-122.3905, 37.7885], zoom: 13.5 }}>
        <MapRoute coordinates={DELIVERY_ROUTE} color="#2563eb" width={4} />
        <MapMarker longitude={WAREHOUSE[0]} latitude={WAREHOUSE[1]}>
          <MarkerContent>
            <div className="h-4 w-4 rounded-sm border-2 border-white bg-neutral-500 shadow-lg" />
          </MarkerContent>
          <MarkerLabel>Distribution warehouse</MarkerLabel>
        </MapMarker>
        <MapMarker longitude={COFFEE_ROASTERY[0]} latitude={COFFEE_ROASTERY[1]}>
          <MarkerContent />
          <MarkerPopup closeButton>
            <p className="text-sm font-medium">Bluebird Coffee Roasters</p>
            <p className="text-muted-foreground text-xs">
              Ferry Building, San Francisco
            </p>
            <p className="text-muted-foreground text-xs">
              4.2 mi from warehouse
            </p>
          </MarkerPopup>
          <MarkerLabel>Bluebird Coffee Roasters</MarkerLabel>
        </MapMarker>
        <MapControls showZoom showCompass />
      </Map>
    </MapCanvas>
  ),
};

// --- Story 1a: OSRM-routed directions ----------------------------------------

const IKEJA_DEPOT = { name: "Ikeja depot", lng: 3.3515, lat: 6.6018 };
const LEKKI_STORE = { name: "Lekki Phase 1 store", lng: 3.4732, lat: 6.4392 };

function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}h ${remainingMins}m`;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function OsrmRouteStory() {
  const [route, setRoute] = useState<{
    coordinates: [number, number][];
    duration: number;
    distance: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchRoute() {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${IKEJA_DEPOT.lng},${IKEJA_DEPOT.lat};${LEKKI_STORE.lng},${LEKKI_STORE.lat}?overview=full&geometries=geojson`,
      );
      const data = await response.json();
      const leg = data.routes?.[0];
      if (!cancelled && leg) {
        setRoute({
          coordinates: leg.geometry.coordinates,
          duration: leg.duration,
          distance: leg.distance,
        });
      }
    }

    fetchRoute();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <MapCanvas>
      <div className="relative h-full w-full">
        <Map
          viewport={{
            center: [
              (IKEJA_DEPOT.lng + LEKKI_STORE.lng) / 2,
              (IKEJA_DEPOT.lat + LEKKI_STORE.lat) / 2,
            ],
            zoom: 11,
          }}
        >
          {route && (
            <MapRoute coordinates={route.coordinates} color="#2563eb" width={5} />
          )}
          <MapMarker longitude={IKEJA_DEPOT.lng} latitude={IKEJA_DEPOT.lat}>
            <MarkerContent>
              <div className="h-4 w-4 rounded-sm border-2 border-white bg-neutral-500 shadow-lg" />
            </MarkerContent>
            <MarkerLabel>{IKEJA_DEPOT.name}</MarkerLabel>
          </MapMarker>
          <MapMarker longitude={LEKKI_STORE.lng} latitude={LEKKI_STORE.lat}>
            <MarkerContent />
            <MarkerLabel>{LEKKI_STORE.name}</MarkerLabel>
          </MapMarker>
          <MapControls showZoom showCompass />
        </Map>
        {route && (
          <div className="border-border bg-background/95 absolute top-3 left-3 flex items-center gap-3 rounded-md border px-3 py-1.5 text-xs shadow-sm">
            <span className="font-medium">{formatDuration(route.duration)}</span>
            <span className="text-muted-foreground">
              {formatDistance(route.distance)}
            </span>
          </div>
        )}
        {!route && (
          <div className="bg-background/50 absolute inset-0 flex items-center justify-center">
            <Loader2 className="text-muted-foreground size-6 animate-spin" />
          </div>
        )}
      </div>
    </MapCanvas>
  );
}

export const OsrmDrivingRoute: Story = {
  name: "OSRM driving route",
  parameters: {
    docs: {
      description: {
        story:
          "A real driving route fetched from the public OSRM API between a depot in Ikeja and a store in Lekki, Lagos — rendered as a single `MapRoute` with no alternatives.",
      },
    },
  },
  render: () => <OsrmRouteStory />,
};


// --- Story 2: site selection result -----------------------------------------

type SiteProps = { name: string; score: number };

function candidateSite(
  name: string,
  score: number,
  center: [number, number],
): GeoJSON.Feature<GeoJSON.Polygon, SiteProps> {
  return {
    type: "Feature",
    properties: { name, score },
    geometry: { type: "Polygon", coordinates: [squareAround(center)] },
  };
}

const CANDIDATE_SITES: GeoJSON.FeatureCollection<GeoJSON.Polygon, SiteProps> = {
  type: "FeatureCollection",
  features: [
    candidateSite("Site A — SoMa", 58, [-122.4148, 37.7705]),
    candidateSite("Site B — Mission", 71, [-122.4194, 37.7599]),
    candidateSite("Site C — Union Square", 92, [-122.4058, 37.7858]),
    candidateSite("Site D — Sunset", 44, [-122.4489, 37.7599]),
    candidateSite("Site E — Noe Valley", 66, [-122.4313, 37.7451]),
  ],
};

const WINNING_SITE = [-122.4058, 37.7858] as const;

export const SiteSelectionResult: Story = {
  name: "Site selection result",
  parameters: {
    docs: {
      description: {
        story:
          "Candidate sites shaded by a suitability score (`MapGeoJSON` with a data-driven `fillPaint` expression), with the winning site called out in a `MapPopup`.",
      },
    },
  },
  render: () => (
    <MapCanvas>
      <Map viewport={{ center: [-122.424, 37.768], zoom: 12 }}>
        <MapGeoJSON<SiteProps>
          id="candidate-sites"
          data={CANDIDATE_SITES}
          promoteId="name"
          interactive
          fillPaint={{
            "fill-color": [
              "interpolate",
              ["linear"],
              ["get", "score"],
              0,
              "#ef4444",
              50,
              "#f59e0b",
              100,
              "#16a34a",
            ],
            "fill-opacity": 0.55,
          }}
          fillHoverPaint={{ "fill-opacity": 0.8 }}
          linePaint={{ "line-color": "#ffffff", "line-width": 1 }}
        />
        <MapPopup
          longitude={WINNING_SITE[0]}
          latitude={WINNING_SITE[1]}
          closeButton
        >
          <p className="text-sm font-medium">Site C — Union Square</p>
          <p className="text-muted-foreground text-xs">
            Suitability score: 92 / 100
          </p>
          <p className="text-muted-foreground text-xs">
            Highest foot traffic + demographic fit
          </p>
        </MapPopup>
        <MapControls showZoom />
      </Map>
    </MapCanvas>
  ),
};

// --- Story 3: access to business sites --------------------------------------

type AccessArc = MapArcDatum & { site: string; minutes: number };

const DISTRIBUTION_CENTER: [number, number] = [-122.3872, 37.758];

const ACCESS_ARCS: AccessArc[] = [
  {
    id: "downtown",
    from: DISTRIBUTION_CENTER,
    to: [-122.4148, 37.7695],
    site: "Downtown store",
    minutes: 9,
  },
  {
    id: "wharf",
    from: DISTRIBUTION_CENTER,
    to: COFFEE_ROASTERY,
    site: "Fisherman's Wharf store",
    minutes: 13,
  },
  {
    id: "noe-valley",
    from: DISTRIBUTION_CENTER,
    to: [-122.4313, 37.7451],
    site: "Noe Valley store",
    minutes: 18,
  },
  {
    id: "sunset",
    from: DISTRIBUTION_CENTER,
    to: [-122.4489, 37.7599],
    site: "Sunset store",
    minutes: 24,
  },
];

export const AccessToBusinessSites: Story = {
  name: "Access to business sites",
  parameters: {
    docs: {
      description: {
        story:
          "Drive-time reachability from a distribution center to its stores — `MapArc` colored by a `minutes` property via a data-driven expression.",
      },
    },
  },
  render: () => (
    <MapCanvas>
      <Map viewport={{ center: [-122.42, 37.765], zoom: 12 }}>
        <MapArc<AccessArc>
          data={ACCESS_ARCS}
          curvature={0.15}
          paint={{
            "line-color": [
              "interpolate",
              ["linear"],
              ["get", "minutes"],
              8,
              "#16a34a",
              20,
              "#f59e0b",
              30,
              "#ef4444",
            ],
            "line-width": 3,
          }}
          hoverPaint={{ "line-width": 5 }}
        />
        <MapMarker
          longitude={DISTRIBUTION_CENTER[0]}
          latitude={DISTRIBUTION_CENTER[1]}
        >
          <MarkerContent>
            <div className="h-4 w-4 rounded-sm border-2 border-white bg-neutral-800 shadow-lg" />
          </MarkerContent>
          <MarkerLabel>Regional distribution center</MarkerLabel>
        </MapMarker>
        {ACCESS_ARCS.map((arc) => (
          <MapMarker key={arc.id} longitude={arc.to[0]} latitude={arc.to[1]}>
            <MarkerContent />
            <MarkerLabel position="bottom">
              {arc.site} · {arc.minutes} min
            </MarkerLabel>
          </MapMarker>
        ))}
        <MapControls showZoom showCompass />
      </Map>
    </MapCanvas>
  ),
};

// --- Story 4: Cloud Optimized GeoTIFF ---------------------------------------

export const CogRasterSample: Story = {
  name: "Cloud Optimized GeoTIFF (COG)",
  parameters: {
    docs: {
      description: {
        story:
          "A Cloud Optimized GeoTIFF loaded straight from cloud storage via `cogUrl` + `MapRasterLayer` — HTTP range requests decoded client-side, no tiling server. Sample imagery from the `@geomatico/maplibre-cog-protocol` demo dataset.",
      },
    },
  },
  render: () => (
    <MapCanvas>
      <Map viewport={{ center: [1.83369, 41.5937], zoom: 14 }}>
        <MapRasterLayer
          url={cogUrl(
            "https://labs.geomatico.es/maplibre-cog-protocol/data/image.tif",
          )}
          tileSize={256}
        />
        <MapControls showZoom showCompass showFullscreen />
      </Map>
    </MapCanvas>
  ),
};

// --- Story 4b: XYZ/TMS raster tile layer -------------------------------------

export const TMSRasterSample: Story = {
  name: "TMS raster layer",
  parameters: {
    docs: {
      description: {
        story:
          "A raster tile layer loaded from a public XYZ/TMS tile server via `MapRasterLayer`'s `tiles` prop (a template array — `url` is for a TileJSON manifest, not a tile template). Drone imagery from the OpenAerialMap dataset, served by HOTOSM's titiler.",
      },
    },
  },
  render: () => (
    <MapCanvas>
      <Map viewport={{ center: [6.7343, 0.3341], zoom: 15 }}>
        <MapRasterLayer
          tiles={[
            "https://titiler.hotosm.org/cog/tiles/WebMercatorQuad/{z}/{x}/{y}@1x.png?url=https://oin-hotosm-temp.s3.us-east-1.amazonaws.com/593ee39ce407d7001138613f/0/fc5e8395-5ef8-46b7-8f49-f710bd95866f.tif&nodata=0",
          ]}
          tileSize={256}
        />
        <MapControls showZoom showCompass showFullscreen />
      </Map>
    </MapCanvas>
  ),
};

// --- Story 5: multiple layers composed together -----------------------------

const TRADE_AREAS: GeoJSON.FeatureCollection<GeoJSON.Polygon> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "North trade area" },
      geometry: {
        type: "Polygon",
        coordinates: [squareAround([-122.415, 37.79], 0.018)],
      },
    },
    {
      type: "Feature",
      properties: { name: "South trade area" },
      geometry: {
        type: "Polygon",
        coordinates: [squareAround([-122.43, 37.745], 0.018)],
      },
    },
  ],
};

const CORRIDOR_ROUTE: [number, number][] = [
  [-122.4194, 37.7749],
  [-122.4108, 37.7822],
  [-122.4011, 37.7896],
  COFFEE_ROASTERY,
];

const DEMAND_POINTS = buildDemandPoints(180, [-122.47, 37.735, -122.39, 37.8]);

// The three z-orderable layers in this demo. Each entry knows how to render
// itself, given the `beforeId` to stack under and a ref callback to report
// its own bottom-most physical MapLibre layer id back up (used to compute
// `beforeId` for whichever layer ends up just below it).
type LayerId = "corridor" | "clusters" | "trade-areas";

const LAYER_LABELS: Record<LayerId, string> = {
  corridor: "Delivery corridor",
  clusters: "Demand points",
  "trade-areas": "Trade areas",
};

function LayerRow({
  id,
  label,
  visible,
  onToggleVisible,
}: {
  id: LayerId;
  label: string;
  visible: boolean;
  onToggleVisible: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "border-border bg-background flex items-center gap-2 rounded-md border px-2 py-1.5 text-sm",
        isDragging && "opacity-50",
      )}
    >
      <button
        type="button"
        aria-label={`Reorder ${label}`}
        className="text-muted-foreground -mx-1 flex size-5 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <label className="flex flex-1 cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={visible}
          onChange={onToggleVisible}
          className="accent-foreground size-3.5"
        />
        <span className={cn(!visible && "text-muted-foreground line-through")}>
          {label}
        </span>
      </label>
    </li>
  );
}

function LayersPanel({
  order,
  visibility,
  onReorder,
  onToggleVisibility,
}: {
  order: LayerId[];
  visibility: Record<LayerId, boolean>;
  onReorder: (order: LayerId[]) => void;
  onToggleVisibility: (id: LayerId) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = order.indexOf(active.id as LayerId);
    const newIndex = order.indexOf(over.id as LayerId);
    onReorder(arrayMove(order, oldIndex, newIndex));
  };

  return (
    <div className="border-border bg-background w-56 shrink-0 border-l p-3">
      <p className="text-foreground mb-2 text-xs font-medium">Layers</p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col gap-1.5">
            {order.map((id) => (
              <LayerRow
                key={id}
                id={id}
                label={LAYER_LABELS[id]}
                visible={visibility[id]}
                onToggleVisible={() => onToggleVisibility(id)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      <p className="text-muted-foreground mt-2 text-[11px]">
        Drag to reorder — top of the list draws on top of the map.
      </p>
    </div>
  );
}

// Reorders the actual MapLibre layers to match `order`/`visibility`, using
// `map.moveLayer` directly. This runs as its own effect inside <Map> (via
// useMap()) rather than feeding ids back into each layer's declarative
// `beforeId` prop — <Source>/<Layer> run their own self-heal cycle on every
// 'styledata' event, and racing that with rapidly-changing `beforeId` props
// during interactive reordering intermittently tried to add a layer before
// a sibling that hadn't been (re-)created yet. Driving the reorder
// imperatively, after every layer is confirmed to already exist, sidesteps
// that race entirely.
function LayerOrderApplier({
  order,
  visibility,
  groupIds,
}: {
  order: LayerId[];
  visibility: Record<LayerId, boolean>;
  groupIds: Partial<Record<LayerId, string[]>>;
}) {
  const { map } = useMap();

  useEffect(() => {
    if (!map) return;
    // `beforeId` starts undefined (top of stack) and becomes each group's
    // bottom-most member as we walk down `order`, so every subsequent group
    // gets placed directly beneath the one above it.
    let beforeId: string | undefined;
    for (const id of order) {
      if (!visibility[id]) continue;
      const ids = groupIds[id];
      if (!ids) continue;
      for (const layerId of ids) {
        if (map.getLayer(layerId)) map.moveLayer(layerId, beforeId);
      }
      beforeId = ids[0];
    }
  }, [map, order, visibility, groupIds]);

  return null;
}

function MultipleLayersStory() {
  // Top-to-bottom stacking order: index 0 draws on top of the map.
  const [order, setOrder] = useState<LayerId[]>([
    "corridor",
    "clusters",
    "trade-areas",
  ]);
  const [visibility, setVisibility] = useState<Record<LayerId, boolean>>({
    corridor: true,
    clusters: true,
    "trade-areas": true,
  });
  // Each layer's physical MapLibre layer ids (bottom-most first), read off
  // its ref — fed to LayerOrderApplier to actually restack the map.
  const [groupIds, setGroupIds] = useState<Partial<Record<LayerId, string[]>>>(
    {},
  );

  const toggleVisibility = (id: LayerId) =>
    setVisibility((prev) => ({ ...prev, [id]: !prev[id] }));

  // Stable setter: bails out (returns the same object) when the ids haven't
  // actually changed, so React can skip the re-render entirely.
  const setGroupId = useCallback((id: LayerId, ids: string[] | undefined) => {
    setGroupIds((prev) => {
      const current = prev[id];
      const unchanged =
        ids === undefined
          ? current === undefined
          : current !== undefined &&
            current.length === ids.length &&
            current.every((value, i) => value === ids[i]);
      return unchanged ? prev : { ...prev, [id]: ids };
    });
  }, []);

  // Ref callbacks must stay referentially stable across renders — an inline
  // arrow here would make React detach+reattach the ref (and thus call
  // setGroupId) on every render, looping forever.
  const tradeAreasRef = useCallback(
    (handle: MapGeoJSONHandle | null) =>
      setGroupId(
        "trade-areas",
        handle ? [handle.fillLayerId, handle.lineLayerId] : undefined,
      ),
    [setGroupId],
  );
  const corridorRef = useCallback(
    (handle: MapRouteHandle | null) =>
      setGroupId("corridor", handle ? [handle.layerId] : undefined),
    [setGroupId],
  );
  const clustersRef = useCallback(
    (handle: MapClusterLayerHandle | null) =>
      setGroupId(
        "clusters",
        handle
          ? [
              handle.clusterLayerId,
              handle.clusterCountLayerId,
              handle.unclusteredLayerId,
            ]
          : undefined,
      ),
    [setGroupId],
  );

  return (
    <MapCanvas>
      <div className="flex h-full w-full">
        <LayersPanel
          order={order}
          visibility={visibility}
          onReorder={setOrder}
          onToggleVisibility={toggleVisibility}
        />
        <div className="relative min-w-0 flex-1">
          <Map viewport={{ center: [-122.42, 37.765], zoom: 11.5 }}>
            {visibility["trade-areas"] && (
              <MapGeoJSON
                id="trade-areas"
                data={TRADE_AREAS}
                fillPaint={{ "fill-color": "#6366f1", "fill-opacity": 0.15 }}
                linePaint={{ "line-color": "#6366f1", "line-width": 1.5 }}
                ref={tradeAreasRef}
              />
            )}
            {visibility.corridor && (
              <MapRoute
                id="corridor"
                coordinates={CORRIDOR_ROUTE}
                color="#111827"
                width={3}
                ref={corridorRef}
              />
            )}
            {visibility.clusters && (
              <MapClusterLayer data={DEMAND_POINTS} ref={clustersRef} />
            )}
            <MapMarker
              longitude={COFFEE_ROASTERY[0]}
              latitude={COFFEE_ROASTERY[1]}
            >
              <MarkerContent />
              <MarkerLabel>Flagship store</MarkerLabel>
            </MapMarker>
            <MapControls showZoom showCompass />
            <LayerOrderApplier
              order={order}
              visibility={visibility}
              groupIds={groupIds}
            />
          </Map>
        </div>
      </div>
    </MapCanvas>
  );
}

export const MultipleLayers: Story = {
  name: "Multiple layers",
  parameters: {
    docs: {
      description: {
        story:
          "Trade-area polygons, a demand-point cluster, a route, and a store marker, with a drag-to-reorder layer panel — dragging a row calls `map.moveLayer` (via each layer's ref) so the map z-order always matches the list, and unchecking a row unmounts that layer.",
      },
    },
  },
  render: () => <MultipleLayersStory />,
};

// --- Story 6: marker overlays — label vs. tooltip vs. popup ------------------

const LABEL_POINT: [number, number] = [-122.418, 37.775];
const TOOLTIP_POINT: [number, number] = [-122.408, 37.775];
const POPUP_POINT: [number, number] = [-122.398, 37.775];

export const MarkerOverlays: Story = {
  name: "Marker overlays",
  parameters: {
    docs: {
      description: {
        story:
          "The three ways to attach text to a `MapMarker`: `MarkerLabel` is always visible, `MarkerTooltip` only shows while hovered, and `MarkerPopup` opens on click and stays open until dismissed.",
      },
    },
  },
  render: () => (
    <MapCanvas>
      <Map viewport={{ center: [-122.408, 37.775], zoom: 13.5 }}>
        <MapMarker longitude={LABEL_POINT[0]} latitude={LABEL_POINT[1]}>
          <MarkerContent />
          <MarkerLabel>Always visible</MarkerLabel>
        </MapMarker>
        <MapMarker longitude={TOOLTIP_POINT[0]} latitude={TOOLTIP_POINT[1]}>
          <MarkerContent />
          <MarkerTooltip>Hover me</MarkerTooltip>
        </MapMarker>
        <MapMarker longitude={POPUP_POINT[0]} latitude={POPUP_POINT[1]}>
          <MarkerContent />
          <MarkerPopup closeButton>
            <p className="text-sm font-medium">Click to open</p>
            <p className="text-muted-foreground text-xs">
              Stays open until dismissed
            </p>
          </MarkerPopup>
        </MapMarker>
        <MapControls showZoom />
      </Map>
    </MapCanvas>
  ),
};

// --- Story 7: 3D terrain & hillshade ------------------------------------------

const TERRAIN_TILES = [
  "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png",
];

export const TerrainAndHillshade: Story = {
  name: "3D terrain & hillshade",
  parameters: {
    docs: {
      description: {
        story:
          "The same raster-dem elevation tiles driving two different effects: `MapTerrain` exaggerates the map's 3D geometry (drag to tilt/rotate), and `MapHillshade` shades a 2D relief layer on top. Elevation tiles from AWS's public Terrarium dataset.",
      },
    },
  },
  render: () => (
    <MapCanvas>
      <Map
        viewport={{
          center: [7.6586, 45.9763],
          zoom: 11.5,
          pitch: 60,
          bearing: -20,
        }}
        maxPitch={70}
      >
        <MapTerrain
          tiles={TERRAIN_TILES}
          encoding="terrarium"
          exaggeration={1.4}
        />
        <MapHillshade
          tiles={TERRAIN_TILES}
          encoding="terrarium"
          paint={{ "hillshade-exaggeration": 0.6 }}
        />
        <MapControls showZoom showCompass showPitch showLocate />
      </Map>
    </MapCanvas>
  ),
};

