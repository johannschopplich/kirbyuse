export const LOG_LEVELS = {
  error: 0,
  warn: 1,
  log: 2,
  info: 3,
  success: 3,
} as const;

export type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];
export type LogType = keyof typeof LOG_LEVELS;

export interface LogEvent {
  level: LogLevel;
  type: LogType;
  tag: string;
  args: any[];
}

export type LogMethod = (...args: any[]) => void;

export interface Logger {
  error: LogMethod;
  warn: LogMethod;
  log: LogMethod;
  info: LogMethod;
  success: LogMethod;
}

type ColorMap = Record<LogLevel, string>;
type TypeColorMap = Record<LogType, string>;

export function createLogger(tag: string): Logger {
  const reporter = new BrowserReporter();

  return new Proxy({} as Logger, {
    get(target, prop) {
      return (...args: any[]) => {
        reporter.log({
          level: LOG_LEVELS[prop as LogType],
          type: prop as LogType,
          tag,
          args,
        });
      };
    },
  });
}

class BrowserReporter {
  private readonly defaultColor = "#7f8c8d"; // Gray
  private readonly levelColorMap: Partial<ColorMap> = {
    0: "#c0392b", // Red
    1: "#f39c12", // Yellow
    3: "#00BCD4", // Cyan
  };
  private readonly typeColorMap: Partial<TypeColorMap> = {
    success: "#2ecc71", // Green
  };

  constructor() {}

  log(logEvent: LogEvent) {
    const consoleLogFn = resolveLogFn(logEvent.level);

    // Type
    const type = logEvent.type === "log" ? "" : logEvent.type;

    // Tag
    const tag = logEvent.tag || "";

    // Styles
    const color =
      this.typeColorMap[logEvent.type as keyof typeof this.typeColorMap] ||
      this.levelColorMap[logEvent.level as keyof typeof this.levelColorMap] ||
      this.defaultColor;
    const style = `
background: ${color};
border-radius: 0.5em;
color: white;
font-weight: bold;
padding: 2px 0.5em;
`.trimStart();

    const badge = `%c${[tag, type].filter(Boolean).join(":")}`;

    // Log to the console
    if (typeof logEvent.args[0] === "string") {
      consoleLogFn(
        `${badge}%c ${logEvent.args[0]}`,
        style,
        // Empty string as style resets to default console style
        "",
        ...logEvent.args.slice(1),
      );
    } else {
      consoleLogFn(badge, style, ...logEvent.args);
    }
  }
}

function resolveLogFn(level: number) {
  if (level < 1) return console.error;
  // eslint-disable-next-line no-console
  return console.log;
}
