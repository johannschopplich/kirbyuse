const LOG_LEVELS = {
  error: 0,
  warn: 1,
  log: 2,
  info: 3,
  success: 3,
} as const;

type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];
type LogType = keyof typeof LOG_LEVELS;
type ColorMap = Record<LogLevel, string>;
type TypeColorMap = Record<LogType, string>;

interface LogEvent {
  level: LogLevel;
  type: LogType;
  tag: string;
  args: any[];
}

export function createLogger(tag: string) {
  const reporter = new BrowserReporter();

  return new Proxy({} as Record<LogType, (...args: any[]) => void>, {
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
    2: "#00BCD4", // Cyan
  };
  private readonly typeColorMap: Partial<TypeColorMap> = {
    success: "#2ecc71", // Green
  };

  constructor() {}

  log(logObj: LogEvent) {
    const consoleLogFn = resolveLogFn(logObj.level);

    // Type
    const type = logObj.type === "log" ? "" : logObj.type;

    // Tag
    const tag = logObj.tag || "";

    // Styles
    const color =
      this.typeColorMap[logObj.type as keyof typeof this.typeColorMap] ||
      this.levelColorMap[logObj.level as keyof typeof this.levelColorMap] ||
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
    if (typeof logObj.args[0] === "string") {
      consoleLogFn(
        `${badge}%c ${logObj.args[0]}`,
        style,
        // Empty string as style resets to default console style
        "",
        ...logObj.args.slice(1),
      );
    } else {
      consoleLogFn(badge, style, ...logObj.args);
    }
  }
}

function resolveLogFn(level: number) {
  if (level < 1) return console.error;
  // eslint-disable-next-line no-console
  return console.log;
}
