import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

type Session = {
  read: (key: string) => unknown;
  write: (key: string, value: unknown) => void;
  report: (text: string) => void;
};
const Context = createContext<Session | null>(null);
export function GameSession({
  scope,
  initial = {},
  onSave,
  children,
}: {
  scope: string;
  initial?: Record<string, unknown>;
  onSave?: (state: Record<string, unknown>, summary: string) => void;
  children: ReactNode;
}) {
  const [warning, setWarning] = useState("");
  const state = useRef<Record<string, unknown> | null>(null);
  const summary = useRef("Ready to play");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const saver = useRef(onSave);
  saver.current = onSave;
  if (!state.current) {
    try {
      state.current =
        JSON.parse(localStorage.getItem(`arcadia.game.${scope}`) || "null") || initial;
    } catch {
      state.current = initial;
    }
  }
  const flush = useCallback(() => {
    saver.current?.({ ...state.current }, summary.current);
  }, []);
  const queue = useCallback(() => {
    try {
      localStorage.setItem(`arcadia.game.${scope}`, JSON.stringify(state.current));
    } catch {
      setWarning(
        "This browser cannot save progress on this device. Keep this page open while playing.",
      );
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(flush, 300);
  }, [scope, flush]);
  useEffect(() => {
    const hidden = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", hidden);
    return () => {
      clearTimeout(timer.current);
      flush();
      document.removeEventListener("visibilitychange", hidden);
    };
  }, [flush]);
  const value = useRef<Session>({
    read: (key) => state.current?.[key],
    write: (key, item) => {
      state.current![key] = item;
      queue();
    },
    report: (text) => {
      summary.current = text;
      queue();
    },
  });
  return (
    <Context.Provider value={value.current}>
      {warning && (
        <p role="status" className="p-4 bg-secondary">
          {warning}
        </p>
      )}
      {children}
    </Context.Provider>
  );
}
export function useGameState<T>(
  key: string,
  initial: T | (() => T),
): [T, Dispatch<SetStateAction<T>>] {
  const context = useContext(Context);
  const [value, setValue] = useState<T>(() => {
    const saved = context?.read(key);
    return saved !== undefined
      ? (saved as T)
      : typeof initial === "function"
        ? (initial as () => T)()
        : initial;
  });
  useEffect(() => {
    context?.write(key, value);
  }, [context, key, value]);
  return [value, setValue];
}
export function useGameProgress(text: string) {
  const context = useContext(Context);
  useEffect(() => {
    context?.report(text);
  }, [context, text]);
}
