interface PluginAsset {
  filename: string;
  url: string;
}

const registeredAssets: PluginAsset[] = [];
const moduleCache = new Map();

export async function registerPluginAssets(assets: PluginAsset[]) {
  if (!Array.isArray(assets)) {
    throw new TypeError(`Expected an array, got ${typeof assets}`);
  }

  for (const asset of assets) {
    if (
      !registeredAssets.some((existing) => existing.filename === asset.filename)
    ) {
      registeredAssets.push(asset);
    }
  }
}

export function resolvePluginAsset(filename: string) {
  if (registeredAssets.length === 0) {
    throw new Error("Plugin assets not registered");
  }

  const asset = registeredAssets.find((asset) => asset.filename === filename);

  if (!asset) {
    throw new Error(`Plugin asset "${filename}" not found`);
  }

  return asset;
}

export async function loadPluginModule(filename: string) {
  if (!filename.endsWith(".js")) {
    filename += ".js";
  }

  if (moduleCache.has(filename)) {
    return moduleCache.get(filename);
  }

  const asset = resolvePluginAsset(filename);
  const mod = await import(/* @vite-ignore */ asset.url);
  moduleCache.set(filename, mod);
  return mod;
}
