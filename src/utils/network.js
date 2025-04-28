import os from "os";

export function getInternalIP() {
  const interfaces = os.networkInterfaces();
  let ipAddress = "unknown";
  for (const iface in interfaces) {
    interfaces[iface].forEach((details) => {
      if (details.family === "IPv4" && iface === "eth0") {
        ipAddress = details.address;
      }
    });
  }
  return ipAddress;
}
