import Constants from "expo-constants";
import { Platform } from "react-native";

const PORT = "8080";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);
const EXPO_TUNNEL_SUFFIXES = [".exp.direct", ".exp.host", ".expo.app"];
const ANDROID_EMULATOR_HOST = "10.0.2.2";
const IOS_SIMULATOR_HOST = "localhost";

const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

const normalizeBaseUrl = (value) => {
  if (!value || typeof value !== "string") {
    return "";
  }

  const trimmedValue = trimTrailingSlash(value.trim());

  if (!trimmedValue) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  return `http://${trimmedValue}`;
};

const getConfiguredBaseUrl = () => {
  const platformSpecificUrl =
    Platform.OS === "web"
      ? process.env.EXPO_PUBLIC_API_URL_WEB
      : process.env.EXPO_PUBLIC_API_URL_NATIVE;

  const explicitUrl =
    platformSpecificUrl ||
    process.env.EXPO_PUBLIC_API_URL ||
    Constants.expoConfig?.extra?.apiBaseUrl;

  return normalizeBaseUrl(explicitUrl);
};

const buildHttpUrl = (host) => `http://${host}:${PORT}`;

const isExpoTunnelHost = (hostname) =>
  EXPO_TUNNEL_SUFFIXES.some((suffix) => hostname.endsWith(suffix));

const extractHostFromUri = (uri = "") => {
  const value = String(uri || "").trim();

  if (!value) {
    return "";
  }

  try {
    const parsed = value.includes("://") ? new URL(value) : new URL(`http://${value}`);
    const hostname = parsed.hostname || "";

    if (!hostname || LOCAL_HOSTS.has(hostname) || isExpoTunnelHost(hostname)) {
      return "";
    }

    return hostname;
  } catch (error) {
    const hostPart = value.split("/")[0].split(":")[0].replace(/^exp\+/, "");

    if (!hostPart || LOCAL_HOSTS.has(hostPart) || isExpoTunnelHost(hostPart)) {
      return "";
    }

    return hostPart;
  }
};

const getExpoDevHost = () =>
  extractHostFromUri(
    Constants.expoConfig?.hostUri ||
      Constants.expoGoConfig?.debuggerHost ||
      Constants.manifest?.debuggerHost ||
      ""
  );

const getWebHost = () => {
  if (typeof window === "undefined") {
    return buildHttpUrl("127.0.0.1");
  }

  const hostname = window.location?.hostname || "";

  if (!hostname || LOCAL_HOSTS.has(hostname) || isExpoTunnelHost(hostname)) {
    return buildHttpUrl("127.0.0.1");
  }

  return buildHttpUrl(hostname);
};

const getNativeHost = () => {
  const expoDevHost = getExpoDevHost();

  if (expoDevHost) {
    return buildHttpUrl(expoDevHost);
  }

  if (Platform.OS === "android") {
    return buildHttpUrl(ANDROID_EMULATOR_HOST);
  }

  if (Platform.OS === "ios") {
    return buildHttpUrl(IOS_SIMULATOR_HOST);
  }

  return buildHttpUrl(IOS_SIMULATOR_HOST);
};

const getBaseUrl = () => {
  const configuredBaseUrl = getConfiguredBaseUrl();

  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  if (Platform.OS === "web") {
    return getWebHost();
  }

  return getNativeHost();
};

export const API_BASE_URL = getBaseUrl();

export const WS_BASE_URL = API_BASE_URL.replace(/^http/, "ws");

export const toApiAssetUrl = (value) => {
  if (!value) {
    return value;
  }

  if (
    value.startsWith("file:") ||
    value.startsWith("content:") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    try {
      const url = new URL(value);

      if (url.pathname.startsWith("/uploads/")) {
        return `${API_BASE_URL}${url.pathname}`;
      }

      return value;
    } catch (error) {
      return value;
    }
  }

  if (value.startsWith("/")) {
    return `${API_BASE_URL}${value}`;
  }

  return `${API_BASE_URL}/${value}`;
};

export const toStoredAssetPath = (value) => {
  if (!value) {
    return value;
  }

  try {
    const url = new URL(value);

    if (url.pathname.startsWith("/uploads/")) {
      return url.pathname;
    }
  } catch (error) {
    if (value.startsWith("/uploads/")) {
      return value;
    }
  }

  return value;
};

export const buildChatSocketUrl = (userId) => `${WS_BASE_URL}/ws/chat?userId=${userId}`;
