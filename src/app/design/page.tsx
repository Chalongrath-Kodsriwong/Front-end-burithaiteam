"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const BASE_GRID_ROWS = 12;
const BASE_GRID_COLS = 8;
const DESIGN_STORAGE_KEY = "design_simulator_v1";

type ProductImage = { url: string; type?: string };
type ApiProduct = {
  id_products: number;
  name: string;
  brand?: string | null;
  short_description?: string | null;
  quality?: string | null;
  spec_table?: unknown;
  category?: { name?: string | null } | null;
  images?: ProductImage[];
  prices?: number[];
  discount?: {
    finalPrices?: number[];
  } | null;
};

type CatalogItem = {
  id: number;
  name: string;
  brand: string;
  image: string;
  price: number;
  category: string;
  shortDescription: string;
  widthMm?: number;
  heightMm?: number;
  pixelWidth?: number;
  pixelHeight?: number;
  receiverMaxPanelsX?: number;
  receiverMaxPanelsY?: number;
};

type SteelItem = {
  id: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  category: string;
};

type PlacedCell = {
  row: number;
  col: number;
  moduleId: number;
};

type GridCellPoint = {
  row: number;
  col: number;
};

type CatalogGroupKey =
  | "module"
  | "magnet"
  | "receiver"
  | "switching"
  | "processor"
  | "sender";

type SummaryRow = {
  key: string;
  label: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

type ZoomMode = "75" | "90" | "100" | "110" | "125" | "150" | "175";

const steelOptions: SteelItem[] = [
  {
    id: "steel-1",
    name: "เหล็กกล่อง 1x1",
    brand: "Steel",
    image: "/image/logo_white.jpeg",
    price: 220,
    category: "steel",
  },
  {
    id: "steel-2",
    name: "เหล็กกล่อง 2x1",
    brand: "Steel",
    image: "/image/logo_white.jpeg",
    price: 320,
    category: "steel",
  },
  {
    id: "steel-3",
    name: "เหล็กกล่อง 2x2",
    brand: "Steel",
    image: "/image/logo_white.jpeg",
    price: 420,
    category: "steel",
  },
];

function getDisplayPrice(product: ApiProduct): number {
  const finalPrices = Array.isArray(product.discount?.finalPrices)
    ? product.discount?.finalPrices
    : [];
  const prices = Array.isArray(product.prices) ? product.prices : [];
  const source = finalPrices.length > 0 ? finalPrices : prices;
  const valid = source
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (valid.length === 0) return 0;
  return Math.min(...valid);
}

function inferPanelDimensions(product: ApiProduct) {
  const specRoot =
    typeof product.spec_table === "object" &&
    product.spec_table !== null &&
    !Array.isArray(product.spec_table)
      ? (product.spec_table as Record<string, unknown>)
      : null;
  const simulatorConfig =
    specRoot &&
    typeof specRoot.simulator_config === "object" &&
    specRoot.simulator_config !== null &&
    !Array.isArray(specRoot.simulator_config)
      ? (specRoot.simulator_config as Record<string, unknown>)
      : specRoot &&
          typeof specRoot.simulatorConfig === "object" &&
          specRoot.simulatorConfig !== null &&
          !Array.isArray(specRoot.simulatorConfig)
        ? (specRoot.simulatorConfig as Record<string, unknown>)
        : null;

  const configWidth = Number(simulatorConfig?.widthMm);
  const configHeight = Number(simulatorConfig?.heightMm);
  if (
    Number.isFinite(configWidth) &&
    configWidth > 0 &&
    Number.isFinite(configHeight) &&
    configHeight > 0
  ) {
    return { widthMm: configWidth, heightMm: configHeight };
  }

  const haystack = `${product.name || ""} ${product.short_description || ""}`;
  const match = haystack.match(/(\d{2,4})\s*[x×]\s*(\d{2,4})\s*(?:mm)?/i);
  if (!match) return null;

  const widthMm = Number(match[1]);
  const heightMm = Number(match[2]);
  if (!Number.isFinite(widthMm) || !Number.isFinite(heightMm)) return null;

  return { widthMm, heightMm };
}

function inferPanelPixels(product: ApiProduct) {
  const specRoot =
    typeof product.spec_table === "object" &&
    product.spec_table !== null &&
    !Array.isArray(product.spec_table)
      ? (product.spec_table as Record<string, unknown>)
      : null;
  const simulatorConfig =
    specRoot &&
    typeof specRoot.simulator_config === "object" &&
    specRoot.simulator_config !== null &&
    !Array.isArray(specRoot.simulator_config)
      ? (specRoot.simulator_config as Record<string, unknown>)
      : specRoot &&
          typeof specRoot.simulatorConfig === "object" &&
          specRoot.simulatorConfig !== null &&
          !Array.isArray(specRoot.simulatorConfig)
        ? (specRoot.simulatorConfig as Record<string, unknown>)
        : null;

  const configPixelWidth = Number(simulatorConfig?.pixelWidth);
  const configPixelHeight = Number(simulatorConfig?.pixelHeight);
  if (
    Number.isFinite(configPixelWidth) &&
    configPixelWidth > 0 &&
    Number.isFinite(configPixelHeight) &&
    configPixelHeight > 0
  ) {
    return { pixelWidth: configPixelWidth, pixelHeight: configPixelHeight };
  }

  const haystack = `${product.name || ""} ${product.short_description || ""}`;

  const labeledMatch = haystack.match(
    /(\d{2,4})\s*[x×]\s*(\d{2,4})\s*(?:pixel|pixels|พิกเซล)/i
  );
  if (labeledMatch) {
    const pixelWidth = Number(labeledMatch[1]);
    const pixelHeight = Number(labeledMatch[2]);
    if (Number.isFinite(pixelWidth) && Number.isFinite(pixelHeight)) {
      return { pixelWidth, pixelHeight };
    }
  }

  const genericMatches = [...haystack.matchAll(/(\d{2,4})\s*[x×]\s*(\d{2,4})/gi)];
  const pixelCandidate = genericMatches
    .map((match) => ({
      pixelWidth: Number(match[1]),
      pixelHeight: Number(match[2]),
    }))
    .find(
      (value) =>
        Number.isFinite(value.pixelWidth) &&
        Number.isFinite(value.pixelHeight) &&
        value.pixelWidth <= 128 &&
        value.pixelHeight <= 128
    );

  return pixelCandidate || null;
}

function inferReceiverCapacity(product: ApiProduct) {
  const specRoot =
    typeof product.spec_table === "object" &&
    product.spec_table !== null &&
    !Array.isArray(product.spec_table)
      ? (product.spec_table as Record<string, unknown>)
      : null;
  const receiverConfig =
    specRoot &&
    typeof specRoot.receiver_simulator_config === "object" &&
    specRoot.receiver_simulator_config !== null &&
    !Array.isArray(specRoot.receiver_simulator_config)
      ? (specRoot.receiver_simulator_config as Record<string, unknown>)
      : specRoot &&
          typeof specRoot.receiverSimulatorConfig === "object" &&
          specRoot.receiverSimulatorConfig !== null &&
          !Array.isArray(specRoot.receiverSimulatorConfig)
        ? (specRoot.receiverSimulatorConfig as Record<string, unknown>)
        : null;

  const maxPanelsX = Number(receiverConfig?.maxPanelsX);
  const maxPanelsY = Number(receiverConfig?.maxPanelsY);

  return {
    maxPanelsX:
      Number.isFinite(maxPanelsX) && maxPanelsX > 0 ? maxPanelsX : undefined,
    maxPanelsY:
      Number.isFinite(maxPanelsY) && maxPanelsY > 0 ? maxPanelsY : undefined,
  };
}

function classifyProduct(product: ApiProduct): CatalogGroupKey | null {
  const category = String(product.category?.name || "").toLowerCase();
  const name = String(product.name || "").toLowerCase();
  const brand = String(product.brand || "").toLowerCase();
  const shortDescription = String(product.short_description || "").toLowerCase();
  const text = `${category} ${name} ${brand} ${shortDescription}`;

  // Prefer explicit categories first so accessory products that mention
  // "LED Module" in their titles/descriptions do not fall into the module group.
  if (/megnent|magnet|magnete|แม่เหล็ก/.test(category)) return "magnet";
  if (/receiver|receiving|receivers/.test(category)) return "receiver";
  if (/switching/.test(category)) return "switching";
  if (/processor/.test(category)) return "processor";
  if (/sender/.test(category)) return "sender";
  if (/^led$|led\s*module|module/.test(category)) return "module";

  if (/magnet|magnete|แม่เหล็ก/.test(text)) return "magnet";
  if (/receiver|receiving|receivers/.test(text)) return "receiver";
  if (/switching/.test(text)) return "switching";
  if (/processor/.test(text)) return "processor";
  if (/sender/.test(text)) return "sender";
  if (/led\s*module|module/.test(text)) return "module";
  return null;
}

function toCatalogItem(product: ApiProduct): CatalogItem {
  const inferred = inferPanelDimensions(product);
  const inferredPixels = inferPanelPixels(product);
  const inferredReceiver = inferReceiverCapacity(product);

  return {
    id: product.id_products,
    name: product.name || "No name",
    brand: product.brand || "-",
    image: product.images?.[0]?.url || "/image/logo_white.jpeg",
    price: getDisplayPrice(product),
    category: product.category?.name || "",
    shortDescription: product.short_description || "",
    widthMm: inferred?.widthMm,
    heightMm: inferred?.heightMm,
    pixelWidth: inferredPixels?.pixelWidth,
    pixelHeight: inferredPixels?.pixelHeight,
    receiverMaxPanelsX: inferredReceiver.maxPanelsX,
    receiverMaxPanelsY: inferredReceiver.maxPanelsY,
  };
}

function formatBaht(value: number) {
  return `${value.toLocaleString()} ฿`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function CatalogCarousel({
  title,
  items,
  sectionKey,
  selectedId,
  onSelect,
  scrollRefs,
  draggable,
}: {
  title: string;
  items: Array<CatalogItem | SteelItem>;
  sectionKey: string;
  selectedId: string | number | null;
  onSelect: (item: CatalogItem | SteelItem) => void;
  scrollRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  draggable?: boolean;
}) {
  const scrollByAmount = (direction: "left" | "right") => {
    const node = scrollRefs.current[sectionKey];
    if (!node) return;
    node.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollByAmount("left")}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-700 transition hover:bg-gray-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollByAmount("right")}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-700 transition hover:bg-gray-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={(node) => {
          scrollRefs.current[sectionKey] = node;
        }}
        className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500">
            ยังไม่มีข้อมูลในหมวดนี้
          </div>
        ) : (
          items.map((item) => {
            const isSelected = String(selectedId) === String(item.id);
            return (
              <button
                key={String(item.id)}
                type="button"
                onClick={() => onSelect(item)}
                draggable={draggable}
                onDragStart={(event) => {
                  if (!draggable) return;
                  event.dataTransfer.setData(
                    "application/x-design-module",
                    String(item.id)
                  );
                  event.dataTransfer.effectAllowed = "copy";
                }}
                className={`min-w-[150px] max-w-[150px] rounded-2xl border p-3 text-left transition ${
                  isSelected
                    ? "border-yellow-500 bg-yellow-50 shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <div className="mb-3 aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/image/logo_white.jpeg";
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <p className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-gray-900">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">{item.brand}</p>
                  <p className="text-sm font-bold text-gray-900">
                    {formatBaht(item.price)}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}

export default function DesignPage() {
  const [moduleItems, setModuleItems] = useState<CatalogItem[]>([]);
  const [magnetItems, setMagnetItems] = useState<CatalogItem[]>([]);
  const [receiverItems, setReceiverItems] = useState<CatalogItem[]>([]);
  const [switchingItems, setSwitchingItems] = useState<CatalogItem[]>([]);
  const [processorItems, setProcessorItems] = useState<CatalogItem[]>([]);
  const [senderItems, setSenderItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedModule, setSelectedModule] = useState<CatalogItem | null>(null);
  const [selectedMagnet, setSelectedMagnet] = useState<CatalogItem | null>(null);
  const [selectedReceiver, setSelectedReceiver] = useState<CatalogItem | null>(null);
  const [selectedSwitching, setSelectedSwitching] = useState<CatalogItem | null>(null);
  const [selectedProcessor, setSelectedProcessor] = useState<CatalogItem | null>(null);
  const [selectedSender, setSelectedSender] = useState<CatalogItem | null>(null);
  const [selectedSteel, setSelectedSteel] = useState<SteelItem>(steelOptions[0]);

  const [placedCells, setPlacedCells] = useState<PlacedCell[]>([]);
  const [gridSize, setGridSize] = useState({
    rows: BASE_GRID_ROWS,
    cols: BASE_GRID_COLS,
  });
  const [zoomMode, setZoomMode] = useState<ZoomMode>("100");
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{
    x: number;
    y: number;
    scrollLeft: number;
    scrollTop: number;
  } | null>(null);
  const [restoredState, setRestoredState] = useState<{
    moduleId?: number;
    receiverId?: number;
    switchingId?: number;
    processorId?: number;
    senderId?: number;
    steelId?: string;
    placedCells?: PlacedCell[];
  } | null>(null);
  const [boardViewportSize, setBoardViewportSize] = useState({
    width: 0,
    height: 0,
  });
  const [selectionStart, setSelectionStart] = useState<GridCellPoint | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<GridCellPoint | null>(null);

  const scrollRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const boardViewportRef = useRef<HTMLDivElement | null>(null);
  const gridBoardRef = useRef<HTMLDivElement | null>(null);
  const lastDragCellRef = useRef<string | null>(null);
  const previousGridSizeRef = useRef({ rows: BASE_GRID_ROWS, cols: BASE_GRID_COLS });

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(DESIGN_STORAGE_KEY);
      if (!raw) return;
      setRestoredState(JSON.parse(raw));
    } catch (error) {
      console.warn("Failed to restore saved design state", error);
    }
  }, []);

  useEffect(() => {
    const node = boardViewportRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setBoardViewportSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    async function fetchCatalog() {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/products`, { cache: "no-store" });
        const json = await res.json().catch(() => ({}));
        const data = Array.isArray(json?.data) ? json.data : [];

    const grouped = {
      module: [] as CatalogItem[],
      magnet: [] as CatalogItem[],
      receiver: [] as CatalogItem[],
      switching: [] as CatalogItem[],
      processor: [] as CatalogItem[],
          sender: [] as CatalogItem[],
        };

        data.forEach((product: ApiProduct) => {
          const kind = classifyProduct(product);
          if (!kind) return;
          const item = toCatalogItem(product);
          if (item.price <= 0) return;
          grouped[kind].push(item);
        });

        setModuleItems(grouped.module);
        setMagnetItems(grouped.magnet);
        setReceiverItems(grouped.receiver);
        setSwitchingItems(grouped.switching);
        setProcessorItems(grouped.processor);
        setSenderItems(grouped.sender);

        setSelectedModule((prev) =>
          prev ||
          grouped.module.find((item) => item.id === restoredState?.moduleId) ||
          grouped.module[0] ||
          null
        );
        setSelectedMagnet((prev) =>
          prev || grouped.magnet[0] || null
        );
        setSelectedReceiver((prev) =>
          prev ||
          grouped.receiver.find((item) => item.id === restoredState?.receiverId) ||
          grouped.receiver[0] ||
          null
        );
        setSelectedSwitching((prev) =>
          prev ||
          grouped.switching.find((item) => item.id === restoredState?.switchingId) ||
          grouped.switching[0] ||
          null
        );
        setSelectedProcessor((prev) =>
          prev ||
          grouped.processor.find((item) => item.id === restoredState?.processorId) ||
          grouped.processor[0] ||
          null
        );
        setSelectedSender((prev) =>
          prev ||
          grouped.sender.find((item) => item.id === restoredState?.senderId) ||
          grouped.sender[0] ||
          null
        );
        setSelectedSteel(
          steelOptions.find((item) => item.id === restoredState?.steelId) ||
            steelOptions[0]
        );
        setPlacedCells(
          Array.isArray(restoredState?.placedCells) ? restoredState.placedCells : []
        );
        const restoredCells = Array.isArray(restoredState?.placedCells)
          ? restoredState.placedCells
          : [];
        const restoredMaxRow = restoredCells.reduce(
          (max, cell) => Math.max(max, cell.row),
          -1
        );
        const restoredMaxCol = restoredCells.reduce(
          (max, cell) => Math.max(max, cell.col),
          -1
        );
        setGridSize({
          rows: Math.max(BASE_GRID_ROWS, restoredMaxRow + 4),
          cols: Math.max(BASE_GRID_COLS, restoredMaxCol + 4),
        });
      } catch (error) {
        console.error("Failed to fetch design catalog:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCatalog();
  }, [restoredState]);

  useEffect(() => {
    if (typeof window === "undefined" || loading) return;

    window.localStorage.setItem(
      DESIGN_STORAGE_KEY,
      JSON.stringify({
        moduleId: selectedModule?.id,
        receiverId: selectedReceiver?.id,
        switchingId: selectedSwitching?.id,
        processorId: selectedProcessor?.id,
        senderId: selectedSender?.id,
        steelId: selectedSteel?.id,
        placedCells,
      })
    );
  }, [
    loading,
    placedCells,
    selectedModule,
    selectedProcessor,
    selectedReceiver,
    selectedSender,
    selectedSteel,
    selectedSwitching,
  ]);

  const placeAt = (row: number, col: number, moduleIdOverride?: number) => {
    const targetModuleId = moduleIdOverride ?? selectedModule?.id;
    if (!targetModuleId) return;

    setPlacedCells((prev) => {
      const exists = prev.find((cell) => cell.row === row && cell.col === col);
      if (exists) {
        return prev.filter(
          (cell) => !(cell.row === row && cell.col === col)
        );
      }

      return [...prev, { row, col, moduleId: targetModuleId }];
    });
  };

  const getCellFromPointer = (clientX: number, clientY: number): GridCellPoint | null => {
    const gridNode = gridBoardRef.current;
    if (!gridNode) return null;

    const rect = gridNode.getBoundingClientRect();
    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      return null;
    }

    const relativeX = clientX - rect.left;
    const relativeY = clientY - rect.top;
    const col = Math.min(gridCols - 1, Math.max(0, Math.floor((relativeX / rect.width) * gridCols)));
    const row = Math.min(gridRows - 1, Math.max(0, Math.floor((relativeY / rect.height) * gridRows)));
    return { row, col };
  };

  const commitSelection = () => {
    if (!selectionStart || !selectionEnd) {
      setIsPointerDown(false);
      lastDragCellRef.current = null;
      return;
    }

    const targetModuleId = selectedModule?.id;
    if (!targetModuleId) {
      setIsPointerDown(false);
      setSelectionStart(null);
      setSelectionEnd(null);
      lastDragCellRef.current = null;
      return;
    }

    const minRow = Math.min(selectionStart.row, selectionEnd.row);
    const maxRow = Math.max(selectionStart.row, selectionEnd.row);
    const minCol = Math.min(selectionStart.col, selectionEnd.col);
    const maxCol = Math.max(selectionStart.col, selectionEnd.col);
    const isSingleCell = minRow === maxRow && minCol === maxCol;

    if (isSingleCell) {
      placeAt(minRow, minCol, targetModuleId);
    } else {
      setPlacedCells((prev) => {
        const next = new Map<string, PlacedCell>();
        prev.forEach((cell) => next.set(`${cell.row}-${cell.col}`, cell));

        for (let row = minRow; row <= maxRow; row += 1) {
          for (let col = minCol; col <= maxCol; col += 1) {
            next.set(`${row}-${col}`, { row, col, moduleId: targetModuleId });
          }
        }

        return Array.from(next.values()).sort((a, b) =>
          a.row === b.row ? a.col - b.col : a.row - b.row
        );
      });
    }

    setIsPointerDown(false);
    setSelectionStart(null);
    setSelectionEnd(null);
    lastDragCellRef.current = null;
  };

  const placementMap = useMemo(() => {
    const map = new Map<string, PlacedCell>();
    placedCells.forEach((cell) => {
      map.set(`${cell.row}-${cell.col}`, cell);
    });
    return map;
  }, [placedCells]);

  const moduleLookup = useMemo(() => {
    const map = new Map<number, CatalogItem>();
    moduleItems.forEach((item) => map.set(item.id, item));
    return map;
  }, [moduleItems]);

  const moduleCounts = useMemo(() => {
    const counts = new Map<number, number>();
    placedCells.forEach((cell) => {
      counts.set(cell.moduleId, (counts.get(cell.moduleId) || 0) + 1);
    });
    return counts;
  }, [placedCells]);

  const occupiedBounds = useMemo(() => {
    if (placedCells.length === 0) return null;
    const rows = placedCells.map((cell) => cell.row);
    const cols = placedCells.map((cell) => cell.col);
    const minRow = Math.min(...rows);
    const maxRow = Math.max(...rows);
    const minCol = Math.min(...cols);
    const maxCol = Math.max(...cols);
    return {
      minRow,
      maxRow,
      minCol,
      maxCol,
      width: maxCol - minCol + 1,
      height: maxRow - minRow + 1,
    };
  }, [placedCells]);

  const selectionBounds = useMemo(() => {
    if (!selectionStart || !selectionEnd) return null;
    const minRow = Math.min(selectionStart.row, selectionEnd.row);
    const maxRow = Math.max(selectionStart.row, selectionEnd.row);
    const minCol = Math.min(selectionStart.col, selectionEnd.col);
    const maxCol = Math.max(selectionStart.col, selectionEnd.col);

    return {
      minRow,
      maxRow,
      minCol,
      maxCol,
      width: maxCol - minCol + 1,
      height: maxRow - minRow + 1,
    };
  }, [selectionEnd, selectionStart]);

  const totalModuleCount = placedCells.length;
  const estimatedMagnetCount = totalModuleCount * 4;
  const estimatedSwitchingCount = totalModuleCount > 0 ? Math.ceil(totalModuleCount / 8) : 0;
  const estimatedProcessorCount = totalModuleCount > 0 && selectedProcessor ? 1 : 0;
  const estimatedSenderCount = totalModuleCount > 0 && selectedSender ? 1 : 0;
  const receiverBlockCols = selectedReceiver?.receiverMaxPanelsX ?? 4;
  const receiverBlockRows = selectedReceiver?.receiverMaxPanelsY ?? 12;
  const selectedModuleWidthMm = selectedModule?.widthMm ?? 320;
  const selectedModuleHeightMm = selectedModule?.heightMm ?? 160;
  const moduleAspectRatio = selectedModuleWidthMm / selectedModuleHeightMm;
  const cellHeightPx = 54;
  const cellWidthPx = Math.round(
    clamp(cellHeightPx * moduleAspectRatio, 84, 180)
  );
  const steelVerticalBarWidthPx = Math.max(
    10,
    Math.round(cellWidthPx * 0.16)
  );
  const steelHorizontalBarHeightPx = Math.max(
    8,
    Math.round(cellHeightPx * 0.1)
  );
  const steelVerticalBarLeftOffsetPx = Math.round(cellWidthPx * 0.18);
  const steelVerticalBarOffsetPx = Math.round(cellWidthPx * 0.7);
  const steelTopBarOffsetPx = Math.round(cellHeightPx * 0.12);
  const steelBottomBarOffsetPx = Math.round(cellHeightPx * 0.78);
  const maxPlacedRow = placedCells.reduce((max, cell) => Math.max(max, cell.row), -1);
  const maxPlacedCol = placedCells.reduce((max, cell) => Math.max(max, cell.col), -1);
  const gridRows = gridSize.rows;
  const gridCols = gridSize.cols;
  const canvasWidthPx = gridCols * cellWidthPx;
  const canvasHeightPx = gridRows * cellHeightPx;
  const boardPaddingPx = 40;
  const rawFitScale = Math.min(
    1,
    boardViewportSize.width > 0
      ? (boardViewportSize.width - boardPaddingPx) / canvasWidthPx
      : 1,
    boardViewportSize.height > 0
      ? (boardViewportSize.height - boardPaddingPx) / canvasHeightPx
      : 1
  );
  const fitScale = Number(Math.min(1, Math.max(0.72, rawFitScale * 1.18)).toFixed(3));
  const manualZoomScaleMap: Record<ZoomMode, number> = {
    "75": 0.75,
    "90": 0.9,
    "100": 1,
    "110": 1.1,
    "125": 1.25,
    "150": 1.5,
    "175": 1.75,
  };
  const boardChromePadding = 72;
  const stageBaseWidth = canvasWidthPx + boardChromePadding;
  const stageBaseHeight = canvasHeightPx + boardChromePadding;
  const manualZoom = manualZoomScaleMap[zoomMode];
  const viewScale = Number((fitScale * manualZoom).toFixed(3));
  const fittedCanvasWidth = stageBaseWidth * viewScale;
  const fittedCanvasHeight = stageBaseHeight * viewScale;
  const isZoomedView = true;
  const screenWidthM = occupiedBounds
    ? Number(((occupiedBounds.width * selectedModuleWidthMm) / 1000).toFixed(2))
    : 0;
  const screenHeightM = occupiedBounds
    ? Number(((occupiedBounds.height * selectedModuleHeightMm) / 1000).toFixed(2))
    : 0;
  const screenAreaSqM = Number((screenWidthM * screenHeightM).toFixed(2));
  const approximatePanelWidthM = totalModuleCount
    ? Number(((totalModuleCount * selectedModuleWidthMm) / 1000).toFixed(2))
    : 0;
  const approximatePanelHeightM = totalModuleCount
    ? Number(((totalModuleCount * selectedModuleHeightMm) / 1000).toFixed(2))
    : 0;
  const approximatePanelAreaSqM = totalModuleCount
    ? Number(
        (
          totalModuleCount *
          (selectedModuleWidthMm / 1000) *
          (selectedModuleHeightMm / 1000)
        ).toFixed(2)
      )
    : 0;
  const steelYPieceCount = totalModuleCount * 2;
  const steelXPieceCount = totalModuleCount * 2;
  const steelYPieceLengthM = Number((selectedModuleHeightMm / 1000).toFixed(3));
  const steelXPieceLengthM = Number((selectedModuleWidthMm / 1000).toFixed(3));
  const steelYPerPanelM = Number((2 * steelYPieceLengthM).toFixed(3));
  const steelXPerPanelM = Number((2 * steelXPieceLengthM).toFixed(3));
  const steelYLinearMeters = Number(
    (steelYPieceCount * steelYPieceLengthM).toFixed(2)
  );
  const steelXLinearMeters = Number(
    (steelXPieceCount * steelXPieceLengthM).toFixed(2)
  );
  const estimatedSteelLinearMeters = Number(
    (steelXLinearMeters + steelYLinearMeters).toFixed(2)
  );
  const switchingCellKeys = useMemo(() => {
    if (!selectedSwitching || estimatedSwitchingCount <= 0 || placedCells.length === 0) {
      return new Set<string>();
    }

    const blockRows = 4;
    const blockCols = 2;
    const keys = new Set<string>();

    const minRow = Math.min(...placedCells.map((cell) => cell.row));
    const maxRow = Math.max(...placedCells.map((cell) => cell.row));
    const minCol = Math.min(...placedCells.map((cell) => cell.col));
    const maxCol = Math.max(...placedCells.map((cell) => cell.col));

    for (let startRow = minRow; startRow <= maxRow; startRow += blockRows) {
      for (let startCol = minCol; startCol <= maxCol; startCol += blockCols) {
        const groupCells = placedCells.filter(
          (cell) =>
            cell.row >= startRow &&
            cell.row < startRow + blockRows &&
            cell.col >= startCol &&
            cell.col < startCol + blockCols
        );
        if (groupCells.length === 0) continue;

        const preferredRow = Math.min(startRow + 2, startRow + blockRows - 1);
        const targetCell =
          groupCells.find(
            (cell) => cell.col === startCol && cell.row === preferredRow
          ) ||
          groupCells.find((cell) => cell.col === startCol) ||
          groupCells[0];

        keys.add(`${targetCell.row}-${targetCell.col}`);
      }
    }

    return keys;
  }, [estimatedSwitchingCount, placedCells, selectedSwitching]);
  const receiverBlocks = useMemo(() => {
    if (placedCells.length === 0) return [] as Array<{
      startRow: number;
      startCol: number;
      cells: PlacedCell[];
    }>;

    const minRow = Math.min(...placedCells.map((cell) => cell.row));
    const maxRow = Math.max(...placedCells.map((cell) => cell.row));
    const minCol = Math.min(...placedCells.map((cell) => cell.col));
    const maxCol = Math.max(...placedCells.map((cell) => cell.col));
    const blocks: Array<{ startRow: number; startCol: number; cells: PlacedCell[] }> = [];

    for (let startRow = minRow; startRow <= maxRow; startRow += receiverBlockRows) {
      for (let startCol = minCol; startCol <= maxCol; startCol += receiverBlockCols) {
        const cells = placedCells.filter(
          (cell) =>
            cell.row >= startRow &&
            cell.row < startRow + receiverBlockRows &&
            cell.col >= startCol &&
            cell.col < startCol + receiverBlockCols
        );
        if (cells.length > 0) {
          blocks.push({ startRow, startCol, cells });
        }
      }
    }

    return blocks;
  }, [placedCells, receiverBlockCols, receiverBlockRows]);
  const estimatedReceiverCount = receiverBlocks.length;
  const receiverCellKeys = useMemo(() => {
    if (!selectedReceiver || estimatedReceiverCount <= 0 || receiverBlocks.length === 0) {
      return new Set<string>();
    }

    const keys = new Set<string>();

    receiverBlocks.forEach((block) => {
      const blockMaxRow = Math.max(...block.cells.map((cell) => cell.row));
      const blockMaxCol = Math.max(...block.cells.map((cell) => cell.col));
      const preferredRow = Math.min(
        block.startRow + Math.max(0, Math.floor(receiverBlockRows / 2) - 1),
        blockMaxRow
      );
      const preferredCol = Math.min(block.startCol, blockMaxCol);
      const targetCell =
        block.cells.find(
          (cell) => cell.col === preferredCol && cell.row === preferredRow
        ) ||
        block.cells.find((cell) => cell.row === preferredRow) ||
        block.cells[block.cells.length - 1];

      keys.add(`${targetCell.row}-${targetCell.col}`);
    });

    return keys;
  }, [
    estimatedReceiverCount,
    receiverBlockRows,
    receiverBlocks,
    selectedReceiver,
  ]);

  const summaryRows = useMemo<SummaryRow[]>(() => {
    const rows: SummaryRow[] = [];

    moduleCounts.forEach((quantity, moduleId) => {
      const item = moduleLookup.get(moduleId);
      if (!item) return;
      rows.push({
        key: `module-${moduleId}`,
        label: `รุ่นจอ ${item.name}`,
        quantity,
        unitPrice: item.price,
        total: quantity * item.price,
      });
    });

    if (selectedReceiver && estimatedReceiverCount > 0) {
      rows.push({
        key: `receiver-${selectedReceiver.id}`,
        label: `รุ่นการ์ด Receiver ${selectedReceiver.name}`,
        quantity: estimatedReceiverCount,
        unitPrice: selectedReceiver.price,
        total: estimatedReceiverCount * selectedReceiver.price,
      });
    }

    if (selectedSwitching && estimatedSwitchingCount > 0) {
      rows.push({
        key: `switching-${selectedSwitching.id}`,
        label: `รุ่น Switching ${selectedSwitching.name}`,
        quantity: estimatedSwitchingCount,
        unitPrice: selectedSwitching.price,
        total: estimatedSwitchingCount * selectedSwitching.price,
      });
    }

    if (selectedProcessor && estimatedProcessorCount > 0) {
      rows.push({
        key: `processor-${selectedProcessor.id}`,
        label: `รุ่น Processor ${selectedProcessor.name}`,
        quantity: estimatedProcessorCount,
        unitPrice: selectedProcessor.price,
        total: estimatedProcessorCount * selectedProcessor.price,
      });
    }

    if (selectedSender && estimatedSenderCount > 0) {
      rows.push({
        key: `sender-${selectedSender.id}`,
        label: `รุ่นการ์ด Sender ${selectedSender.name}`,
        quantity: estimatedSenderCount,
        unitPrice: selectedSender.price,
        total: estimatedSenderCount * selectedSender.price,
      });
    }

    if (estimatedSteelLinearMeters > 0) {
      rows.push({
        key: `${selectedSteel.id}-x`,
        label: `เหล็กแกน X ${selectedSteel.name} (${steelXPieceLengthM.toLocaleString()} ม./ช่วงคาน)`,
        quantity: steelXLinearMeters,
        unitPrice: selectedSteel.price,
        total: steelXLinearMeters * selectedSteel.price,
      });
      rows.push({
        key: `${selectedSteel.id}-y`,
        label: `เหล็กแกน Y ${selectedSteel.name} (${steelYPieceLengthM.toLocaleString()} ม./ช่วงราง)`,
        quantity: steelYLinearMeters,
        unitPrice: selectedSteel.price,
        total: steelYLinearMeters * selectedSteel.price,
      });
    }

    return rows;
  }, [
    estimatedProcessorCount,
    estimatedReceiverCount,
    estimatedSenderCount,
    estimatedSwitchingCount,
    moduleCounts,
    moduleLookup,
    selectedProcessor,
    selectedReceiver,
    selectedSender,
    selectedSteel,
    selectedSwitching,
    steelXLinearMeters,
    steelXPerPanelM,
    steelXPieceLengthM,
    steelYLinearMeters,
    steelYPerPanelM,
    steelYPieceLengthM,
  ]);

  const grandTotal = summaryRows.reduce((sum, row) => sum + row.total, 0);

  useEffect(() => {
    setGridSize((prev) => {
      const targetRows = Math.max(BASE_GRID_ROWS, maxPlacedRow + 4);
      const targetCols = Math.max(BASE_GRID_COLS, maxPlacedCol + 4);

      if (targetRows === prev.rows && targetCols === prev.cols) {
        return prev;
      }

      return { rows: targetRows, cols: targetCols };
    });
  }, [maxPlacedCol, maxPlacedRow]);

  useEffect(() => {
    const previous = previousGridSizeRef.current;
    const gridExpanded =
      gridSize.rows > previous.rows || gridSize.cols > previous.cols;

    if (gridExpanded && isPointerDown) {
      setIsPointerDown(false);
      setSelectionStart(null);
      setSelectionEnd(null);
      lastDragCellRef.current = null;
    }

    previousGridSizeRef.current = gridSize;
  }, [gridSize, isPointerDown]);

  useEffect(() => {
    if (!isZoomedView) {
      setIsPanning(false);
      setPanStart(null);
      const viewport = boardViewportRef.current;
      if (viewport) {
        viewport.scrollTo({ left: 0, top: 0, behavior: "smooth" });
      }
    }
  }, [isZoomedView]);

  return (
    <div className="min-h-screen bg-white px-4 py-6 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-black sm:text-3xl">LED Design Simulator</h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-600 sm:text-base">
            เลือกรุ่นจอทางขวา แล้วคลิกหรือกดลากบนตารางเพื่อจำลองการติดตั้ง ระบบจะคำนวณจำนวนอุปกรณ์ที่ต้องใช้และราคารวมให้อัตโนมัติในเวอร์ชันแรกนี้
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(340px,0.95fr)]">
          <section className="rounded-[28px] border border-[#e4d7c3] bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-500">Grid Canvas</p>
                <h2 className="text-lg font-bold sm:text-xl">หน้าตารางออกแบบจอ</h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPlacedCells([])}
                  className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
                >
                  <RotateCcw className="mr-1 inline h-4 w-4" /> ล้างทั้งหมด
                </button>
              </div>
            </div>

              <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl bg-white p-3 text-sm text-gray-600 shadow-sm">
              <span>
                รุ่นจอที่กำลังเลือก: <strong className="text-gray-900">{selectedModule?.name || "ยังไม่ได้เลือก"}</strong>
              </span>
              <span>
                จำนวนแผ่นที่วาง: <strong className="text-gray-900">{totalModuleCount}</strong>
              </span>
              {occupiedBounds && (
                <span>
                  พื้นที่รวม: <strong className="text-gray-900">{occupiedBounds.width} x {occupiedBounds.height}</strong>
                </span>
              )}
              {screenAreaSqM > 0 && (
                <span>
                  ขนาดจริง: <strong className="text-gray-900">{screenWidthM} x {screenHeightM} ม.</strong>
                </span>
              )}
            </div>

            <div
              className="relative h-[min(78vh,820px)] overflow-hidden rounded-[28px] border-2 border-[#e5e7eb] bg-white p-4 shadow-[inset_0_0_0_1px_rgba(229,231,235,0.8)]"
              onPointerUp={() => {
                if (selectionStart) {
                  commitSelection();
                  return;
                }
                setIsPointerDown(false);
                lastDragCellRef.current = null;
              }}
              onPointerLeave={() => {
                if (selectionStart) {
                  commitSelection();
                  return;
                }
                setIsPointerDown(false);
                lastDragCellRef.current = null;
              }}
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-gray-500">
                <div className="flex flex-wrap items-center gap-3">
                  <span>Simulator Board</span>
                  <span>
                    ช่อง {gridCols} x {gridRows}
                  </span>
                  <span>
                    Scale {cellWidthPx} x {cellHeightPx} px / panel
                  </span>
                  <span>Zoom {zoomMode}%</span>
                  <div className="flex flex-wrap items-center gap-2 rounded-full bg-white/90 px-2 py-1 shadow-sm">
                    {(
                      ["75", "90", "100", "110", "125", "150", "175"] as ZoomMode[]
                    ).map((option) => (
                      <label
                        key={option}
                        className={`flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 transition ${
                          zoomMode === option
                            ? "bg-black text-yellow-400"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <input
                          type="radio"
                          name="design-zoom"
                          value={option}
                          checked={zoomMode === option}
                          onChange={() => setZoomMode(option)}
                          className="h-3 w-3"
                        />
                        <span>{`${option}%`}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="rounded-full bg-white px-3 py-1 text-[11px] text-gray-600 shadow-sm">
                  ซูมแล้วสามารถกดลากเพื่อเลื่อนขึ้นลงซ้ายขวาได้
                </div>
              </div>

              <div
                ref={boardViewportRef}
                className="h-[calc(100%-2.5rem)] overflow-auto rounded-[22px] bg-white p-6"
                onPointerDown={(event) => {
                  if (!boardViewportRef.current) return;
                  setIsPanning(true);
                  setPanStart({
                    x: event.clientX,
                    y: event.clientY,
                    scrollLeft: boardViewportRef.current.scrollLeft,
                    scrollTop: boardViewportRef.current.scrollTop,
                  });
                }}
                onPointerMove={(event) => {
                  if (!isPanning || !panStart || !boardViewportRef.current) {
                    return;
                  }
                  boardViewportRef.current.scrollLeft =
                    panStart.scrollLeft - (event.clientX - panStart.x);
                  boardViewportRef.current.scrollTop =
                    panStart.scrollTop - (event.clientY - panStart.y);
                }}
                onPointerUp={() => {
                  setIsPanning(false);
                  setPanStart(null);
                }}
                onPointerLeave={() => {
                  setIsPanning(false);
                  setPanStart(null);
                }}
                style={{
                  cursor: isPanning ? "grabbing" : "grab",
                }}
              >
                <div
                  className="min-h-full min-w-full"
                >
                  <div
                    className="relative"
                    style={{
                      width: fittedCanvasWidth,
                      height: fittedCanvasHeight,
                    }}
                  >
                    <div
                      className="absolute left-0 top-0"
                      style={{
                        width: stageBaseWidth,
                        height: stageBaseHeight,
                        transform: `scale(${viewScale || 1})`,
                        transformOrigin: "top left",
                      }}
                    >
                {/* <div className="pointer-events-none absolute left-4 top-8 text-3xl font-light text-gray-800">
                  X:
                </div>
                <div className="pointer-events-none absolute left-0 top-[5.6rem] rotate-[-90deg] text-3xl font-light text-gray-800">
                  Y:
                </div> */}

                <div
                  ref={gridBoardRef}
                  className="relative ml-12 mt-10"
                  style={{ width: canvasWidthPx, height: canvasHeightPx }}
                  onPointerDown={(event) => {
                    if (!selectedModule) return;
                    event.preventDefault();
                    event.stopPropagation();
                    const cell = getCellFromPointer(event.clientX, event.clientY);
                    if (!cell) return;
                    setIsPointerDown(true);
                    setSelectionStart(cell);
                    setSelectionEnd(cell);
                    lastDragCellRef.current = `${cell.row}-${cell.col}`;
                  }}
                  onPointerMove={(event) => {
                    if (!isPointerDown || !selectionStart) return;
                    event.preventDefault();
                    const cell = getCellFromPointer(event.clientX, event.clientY);
                    if (!cell) return;
                    const cellKey = `${cell.row}-${cell.col}`;
                    if (lastDragCellRef.current === cellKey) return;
                    lastDragCellRef.current = cellKey;
                    setSelectionEnd(cell);
                  }}
                  onPointerUp={(event) => {
                    if (!selectionStart) return;
                    event.preventDefault();
                    event.stopPropagation();
                    commitSelection();
                  }}
                  onPointerCancel={() => {
                    setIsPointerDown(false);
                    setSelectionStart(null);
                    setSelectionEnd(null);
                    lastDragCellRef.current = null;
                  }}
                >
                  <div className="pointer-events-none absolute inset-x-0 -top-6 flex text-[11px] font-semibold text-gray-400">
                    {Array.from({ length: gridCols }).map((_, col) => (
                      <div
                        key={`col-label-${col}`}
                        className="text-center"
                        style={{ width: cellWidthPx }}
                      >
                        {col + 1}
                      </div>
                    ))}
                  </div>
                  <div className="pointer-events-none absolute inset-y-0 -left-8 flex flex-col text-[11px] font-semibold text-gray-400">
                    {Array.from({ length: gridRows }).map((_, row) => (
                      <div
                        key={`row-label-${row}`}
                        className="flex items-center justify-center"
                        style={{ height: cellHeightPx }}
                      >
                        {row + 1}
                      </div>
                    ))}
                  </div>

                  <div className="pointer-events-none absolute inset-0 z-[1]">
                    {Array.from({ length: gridCols }).map((_, col) => (
                      <div key={`steel-vertical-group-${col}`}>
                        <div
                          className="absolute bg-[#cfcfcf] shadow-[inset_0_0_0_1px_rgba(72,72,72,0.22)]"
                          style={{
                            top: 0,
                            left: col * cellWidthPx + steelVerticalBarLeftOffsetPx,
                            width: steelVerticalBarWidthPx,
                            height: canvasHeightPx,
                          }}
                        />
                        <div
                          className="absolute bg-[#cfcfcf] shadow-[inset_0_0_0_1px_rgba(72,72,72,0.22)]"
                          style={{
                            top: 0,
                            left: col * cellWidthPx + steelVerticalBarOffsetPx,
                            width: steelVerticalBarWidthPx,
                            height: canvasHeightPx,
                          }}
                        />
                      </div>
                    ))}
                    {Array.from({ length: gridRows }).map((_, row) => (
                      <div key={`steel-horizontal-group-${row}`}>
                        <div
                          className="absolute bg-[#d8d8d8] shadow-[inset_0_0_0_1px_rgba(72,72,72,0.22)]"
                          style={{
                            top: row * cellHeightPx + steelTopBarOffsetPx,
                            left: 0,
                            width: canvasWidthPx,
                            height: steelHorizontalBarHeightPx,
                          }}
                        />
                        <div
                          className="absolute bg-[#d8d8d8] shadow-[inset_0_0_0_1px_rgba(72,72,72,0.22)]"
                          style={{
                            top: row * cellHeightPx + steelBottomBarOffsetPx,
                            left: 0,
                            width: canvasWidthPx,
                            height: steelHorizontalBarHeightPx,
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  {selectionBounds && (
                    <div
                      className="pointer-events-none absolute z-[3] border-2 border-dashed border-[#67f045] bg-[#67f045]/10"
                      style={{
                        top: selectionBounds.minRow * cellHeightPx,
                        left: selectionBounds.minCol * cellWidthPx,
                        width: selectionBounds.width * cellWidthPx,
                        height: selectionBounds.height * cellHeightPx,
                      }}
                    />
                  )}

                  <div
                    className="relative z-[2] grid"
                    style={{
                      gridTemplateColumns: `repeat(${gridCols}, ${cellWidthPx}px)`,
                      gridTemplateRows: `repeat(${gridRows}, ${cellHeightPx}px)`,
                      width: canvasWidthPx,
                      height: canvasHeightPx,
                    }}
                  >
                    {Array.from({ length: gridRows * gridCols }).map((_, index) => {
                      const row = Math.floor(index / gridCols);
                      const col = index % gridCols;
                      const cell = placementMap.get(`${row}-${col}`);
                      const module = cell ? moduleLookup.get(cell.moduleId) : null;
                      const hasSwitchingVisual = switchingCellKeys.has(`${row}-${col}`);
                      const hasReceiverVisual = receiverCellKeys.has(`${row}-${col}`);
                      const pixelCols = module?.pixelWidth ?? 64;
                      const pixelRows = module?.pixelHeight ?? 32;
                      const dotX = Math.max(3.4, Math.min(13, 190 / pixelCols));
                      const dotY = Math.max(3.4, Math.min(13, 190 / pixelRows));

                      return (
                        <button
                          key={`${row}-${col}`}
                          type="button"
                          onDragOver={(event) => {
                            event.preventDefault();
                            event.dataTransfer.dropEffect = "copy";
                          }}
                          onDrop={(event) => {
                            event.preventDefault();
                            const draggedModuleId = Number(
                              event.dataTransfer.getData("application/x-design-module")
                            );
                            if (
                              Number.isFinite(draggedModuleId) &&
                              draggedModuleId > 0
                            ) {
                              placeAt(row, col, draggedModuleId);
                              const draggedModule = moduleItems.find(
                                (item) => item.id === draggedModuleId
                              );
                              if (draggedModule) {
                                setSelectedModule(draggedModule);
                              }
                            }
                          }}
                          className={`relative border border-[#eddcc7] transition ${
                            cell
                              ? "bg-transparent"
                              : "bg-white hover:bg-[#fff8ee]"
                          }`}
                          style={{ width: cellWidthPx, height: cellHeightPx }}
                        >
                          {module && (
                            <>
                              {hasSwitchingVisual && (
                                <div className="pointer-events-none absolute inset-0 z-[0] flex items-center justify-end pr-[7%]">
                                  <div className="relative h-[70%] w-[20%] rounded-[10px] border-[3px] border-[#e04a3a] bg-white/92 shadow-[0_0_0_1px_rgba(224,74,58,0.18)]">
                                    <div className="absolute inset-x-[16%] top-[8%] h-[9%] rounded-sm border border-[#e04a3a] bg-[#fff5f3]" />
                                    <div className="absolute inset-x-[14%] top-[21%] h-[31%] rounded-sm border border-[#e04a3a] bg-[radial-gradient(circle,rgba(224,74,58,0.7)_0_24%,rgba(224,74,58,0)_30%)] [background-size:6px_6px]" />
                                    <div className="absolute inset-x-[21%] bottom-[28%] h-[15%] rounded-sm border border-[#e04a3a] bg-[#fff8f6]" />
                                    <div className="absolute inset-x-[14%] bottom-[8%] flex justify-between">
                                      {Array.from({ length: 4 }).map((_, terminalIndex) => (
                                        <span
                                          key={`switching-${row}-${col}-${terminalIndex}`}
                                          className="h-[7px] w-[7px] rounded-full border border-[#e04a3a] bg-white"
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                              {hasReceiverVisual && (
                                <div className="pointer-events-none absolute inset-0 z-[0] flex items-end justify-center pb-[10%]">
                                  <div className="relative h-[46%] w-[24%] rounded-[8px] border-[3px] border-[#2f6fe6] bg-white/92 shadow-[0_0_0_1px_rgba(47,111,230,0.18)]">
                                    <div className="absolute inset-x-[10%] top-[8%] h-[12%] rounded-sm border border-[#2f6fe6] bg-[#f3f7ff]" />
                                    <div className="absolute inset-x-[16%] top-[24%] h-[42%] rounded-sm border border-[#2f6fe6] bg-[radial-gradient(circle,rgba(47,111,230,0.78)_0_18%,rgba(47,111,230,0)_24%)] [background-size:6px_6px]" />
                                    <div className="absolute inset-y-[18%] left-[14%] w-[8%] rounded-sm border border-[#2f6fe6] bg-[#f8fbff]" />
                                    <div className="absolute inset-y-[18%] right-[14%] w-[8%] rounded-sm border border-[#2f6fe6] bg-[#f8fbff]" />
                                    <div className="absolute inset-x-[14%] bottom-[8%] flex justify-between">
                                      {Array.from({ length: 3 }).map((_, portIndex) => (
                                        <span
                                          key={`receiver-${row}-${col}-${portIndex}`}
                                          className="h-[7px] w-[7px] rounded-sm border border-[#2f6fe6] bg-white"
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                              <div className="pointer-events-none absolute inset-[4%] z-[1] rounded-[1px] border-[4px] border-[#67f045] bg-transparent shadow-[0_0_0_1px_rgba(90,120,92,0.18)]">
                                <div
                                  className="absolute inset-[1.5%] rounded-[1px]"
                                  style={{
                                    backgroundColor: "transparent",
                                    backgroundImage:
                                      "radial-gradient(circle, rgba(93,172,86,0.9) 0 44%, rgba(93,172,86,0) 54%)",
                                    backgroundSize: `${dotX}% ${dotY}%`,
                                    backgroundPosition: "center",
                                  }}
                                />
                                {/* <div className="absolute inset-x-[13%] top-[23%] h-[2px] bg-[rgba(32,32,32,0.78)]" />
                                <div className="absolute inset-x-[13%] bottom-[23%] h-[2px] bg-[rgba(32,32,32,0.78)]" />
                                <div className="absolute inset-y-[12%] left-[24%] w-[2px] bg-[rgba(32,32,32,0.78)]" />
                                <div className="absolute inset-y-[12%] right-[24%] w-[2px] bg-[rgba(32,32,32,0.78)]" /> */}
                              </div>
                              <div className="pointer-events-none absolute left-1 top-1 z-[2] rounded bg-white/85 px-1 py-[1px] text-[8px] font-bold text-[#41b52c] shadow-sm sm:text-[9px]">
                                {pixelCols} x {pixelRows}
                              </div>
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>

                </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-black">จำนวนหลักสินค้า</h2>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="rounded-2xl bg-gray-50 px-4 py-3">
                  <div className="font-semibold text-gray-900">จำนวน Switching</div>
                  <div>
                    {estimatedSwitchingCount} ตัว {selectedSwitching ? `• ${selectedSwitching.name}` : ""}
                  </div>
                </div>
                <div className="rounded-2xl bg-gray-50 px-4 py-3">
                  <div className="font-semibold text-gray-900">จำนวนการ์ด Receiver</div>
                  <div>
                    {estimatedReceiverCount} ตัว {selectedReceiver ? `• ${selectedReceiver.name}` : ""}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {selectedReceiver
                      ? `1 การ์ด รองรับได้ แกน X ${receiverBlockCols} แผ่น • แกน Y ${receiverBlockRows} แผ่น`
                      : ""}
                  </div>
                </div>
                <div className="rounded-2xl bg-gray-50 px-4 py-3">
                  <div className="font-semibold text-gray-900">จำนวนแผ่นจอ</div>
                  <div>{totalModuleCount} แผ่น {selectedModule ? `• ${selectedModule.name}` : ""}</div>
                </div>
                <div className="rounded-2xl bg-gray-50 px-4 py-3">
                  <div className="font-semibold text-gray-900">จำนวนเหล็ก</div>
                  <div>
                    แกน X {steelXLinearMeters.toLocaleString()} ม. • แกน Y {steelYLinearMeters.toLocaleString()} ม.
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {selectedSteel.name}
                    {estimatedSteelLinearMeters > 0
                      ? ` • รวม ${estimatedSteelLinearMeters.toLocaleString()} ม.`
                      : ""}
                  </div>
                  <div className="mt-1 text-[11px] text-gray-400">
                    แกน Y เป็นรางรับแผ่นจอ • แกน X เป็นคานคาดเชื่อมราง
                  </div>
                </div>
                <div className="rounded-2xl bg-gray-50 px-4 py-3">
                  <div className="font-semibold text-gray-900">Processor / Sender</div>
                  <div>
                    Processor {estimatedProcessorCount} ตัว • Sender {estimatedSenderCount} ตัว
                  </div>
                </div>
                <div className="rounded-2xl bg-gray-50 px-4 py-3">
                  <div className="font-semibold text-gray-900">ขนาดจอโดยประมาณ</div>
                  <div>
                    {approximatePanelWidthM > 0 && approximatePanelHeightM > 0
                      ? `แกน X ${approximatePanelWidthM} ม. • แกน Y ${approximatePanelHeightM} ม.`
                      : "ยังไม่ได้วางแผ่นจอ"}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {approximatePanelAreaSqM > 0
                      ? `รวมพื้นที่แผ่นจอ ${approximatePanelAreaSqM} ตร.ม.`
                      : ""}
                  </div>
                </div>
                <div className="rounded-2xl bg-gray-50 px-4 py-3">
                  <div className="font-semibold text-gray-900">ยี่ห้อและรุ่นแม่เหล็กที่เลือก</div>
                  <div>
                    {selectedMagnet && estimatedMagnetCount > 0
                      ? `${selectedMagnet.brand} • ${selectedMagnet.name}`
                      : "ยังไม่ได้เลือกหรือวางแผ่นจอ"}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {estimatedMagnetCount > 0
                      ? `ใช้ทั้งหมด ${estimatedMagnetCount.toLocaleString()} ตัว (1 จอใช้ 4 ตัว)`
                      : ""}
                  </div>
                </div>
              </div>
            </section>

            <CatalogCarousel
              title="รุ่นของแผงจอ LED Module"
              items={moduleItems}
              sectionKey="module"
              selectedId={selectedModule?.id ?? null}
              onSelect={(item) => {
                setSelectedModule(item as CatalogItem);
              }}
              scrollRefs={scrollRefs}
              draggable
            />

            <CatalogCarousel
              title="รุ่นของแม่เหล็กยึดจอ"
              items={magnetItems}
              sectionKey="magnet"
              selectedId={selectedMagnet?.id ?? null}
              onSelect={(item) => setSelectedMagnet(item as CatalogItem)}
              scrollRefs={scrollRefs}
            />

            <CatalogCarousel
              title="รุ่นของการ์ด Receiver"
              items={receiverItems}
              sectionKey="receiver"
              selectedId={selectedReceiver?.id ?? null}
              onSelect={(item) => setSelectedReceiver(item as CatalogItem)}
              scrollRefs={scrollRefs}
            />

            <CatalogCarousel
              title="ขนาดของเหล็ก"
              items={steelOptions}
              sectionKey="steel"
              selectedId={selectedSteel.id}
              onSelect={(item) => setSelectedSteel(item as SteelItem)}
              scrollRefs={scrollRefs}
            />

            <CatalogCarousel
              title="รุ่นของ Switching"
              items={switchingItems}
              sectionKey="switching"
              selectedId={selectedSwitching?.id ?? null}
              onSelect={(item) => setSelectedSwitching(item as CatalogItem)}
              scrollRefs={scrollRefs}
            />

            <CatalogCarousel
              title="รุ่นของ Processor"
              items={processorItems}
              sectionKey="processor"
              selectedId={selectedProcessor?.id ?? null}
              onSelect={(item) => setSelectedProcessor(item as CatalogItem)}
              scrollRefs={scrollRefs}
            />

            <CatalogCarousel
              title="รุ่นของการ์ด Sender"
              items={senderItems}
              sectionKey="sender"
              selectedId={selectedSender?.id ?? null}
              onSelect={(item) => setSelectedSender(item as CatalogItem)}
              scrollRefs={scrollRefs}
            />
          </aside>
        </div>

        <section className="rounded-[28px] border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">รายการวัสดุทั้งหมด</h2>
              <p className="text-sm text-gray-500">คำนวณจากรายการที่เลือกและจำนวนแผ่นที่วางบนตารางในตอนนี้</p>
            </div>
            <div className="rounded-2xl bg-black px-5 py-3 text-right text-white">
              <div className="text-xs uppercase tracking-[0.24em] text-yellow-400">รวมราคาทั้งหมด</div>
              <div className="text-2xl font-black">{formatBaht(grandTotal)}</div>
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-10 text-center text-gray-500">
              กำลังโหลดข้อมูลสินค้า...
            </div>
          ) : summaryRows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-10 text-center text-gray-500">
              ยังไม่มีรายการที่เลือก ลองเลือกรุ่นจอทางขวาแล้วคลิกวางในตารางก่อนครับ
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse overflow-hidden rounded-2xl border border-gray-200">
                <thead className="bg-[#f8f6f3] text-sm font-semibold text-gray-700">
                  <tr>
                    <th className="border-b border-gray-200 px-4 py-3 text-left">รายการ</th>
                    <th className="border-b border-gray-200 px-4 py-3 text-center">จำนวน</th>
                    <th className="border-b border-gray-200 px-4 py-3 text-right">ราคาต่อชิ้น</th>
                    <th className="border-b border-gray-200 px-4 py-3 text-right">รวมทั้งหมด</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryRows.map((row) => (
                    <tr key={row.key} className="text-sm text-gray-700 odd:bg-white even:bg-[#fcfbf8]">
                      <td className="border-b border-gray-100 px-4 py-3">{row.label}</td>
                      <td className="border-b border-gray-100 px-4 py-3 text-center">{row.label.includes("เหล็กแกน") ? `${row.quantity.toLocaleString()} ม.` : row.quantity}</td>
                      <td className="border-b border-gray-100 px-4 py-3 text-right">{formatBaht(row.unitPrice)}</td>
                      <td className="border-b border-gray-100 px-4 py-3 text-right font-semibold">{formatBaht(row.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#f5efe5] text-sm font-bold text-gray-900">
                    <td className="px-4 py-4" colSpan={3}>รวมราคาทั้งหมด</td>
                    <td className="px-4 py-4 text-right">{formatBaht(grandTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
