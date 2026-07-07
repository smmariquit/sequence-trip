// jest.setup.ts

jest.mock("react-native-reanimated", () => ({
  useSharedValue: (init: unknown) => ({ value: init }),
  useDerivedValue: (fn: () => unknown) => ({ value: typeof fn === "function" ? fn() : fn }),
  useFrameCallback: jest.fn(),
  withTiming: (v: unknown) => v,
  withRepeat: (v: unknown) => v,
  Easing: {
    linear: (t: number) => t,
    inOut: () => (t: number) => t,
    sin: () => (t: number) => t,
  },
}));

jest.mock("@shopify/react-native-skia", () => ({
  Skia: {
    Path: {
      Make: jest.fn(() => ({
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        addArc: jest.fn(),
      })),
    },
  },
  Canvas: "Canvas",
  Path: "Path",
  Circle: "Circle",
  Group: "Group",
  BlurMask: "BlurMask",
  Line: "Line",
}));

jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: jest.fn() },
  useLocalSearchParams: jest.fn(() => ({})),
  Link: "Link",
  Stack: "Stack",
}));

jest.mock("expo-haptics", () => ({
  selectionAsync: jest.fn(),
}));

jest.mock("expo-sqlite", () => ({
  openDatabaseAsync: jest.fn(),
  importDatabaseFromAssetAsync: jest.fn(),
}));

global.requestAnimationFrame = (cb: FrameRequestCallback) =>
  setTimeout(() => cb(performance.now()), 16) as unknown as number;
global.cancelAnimationFrame = (id: number) => clearTimeout(id);
