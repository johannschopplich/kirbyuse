const LOCALHOST_HOSTNAMES = ["localhost", "127.0.0.1", "[::1]"];

const LOCAL_TLD_SUFFIXES = [
  "localhost",
  "local", // Local by Flywheel, general
  "test", // Laravel Herd, Valet
  "ddev.site", // DDEV
];

export function isLocalDev(): boolean {
  const { hostname } = window.location;
  const isLocalHostname = LOCALHOST_HOSTNAMES.includes(hostname);
  const isLocalTld = LOCAL_TLD_SUFFIXES.some((suffix) =>
    hostname.endsWith(`.${suffix}`),
  );

  return isLocalHostname || isLocalTld;
}
