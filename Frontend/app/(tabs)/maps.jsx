import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  useColorScheme,
  Alert,
  Platform,
  TouchableOpacity,
  Linking,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import config from "../../config";

const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
];

export default function Maps() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [region, setRegion] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const apiAbortRef = useRef(null);
  const debounceRef = useRef(null);

  const API_URL = `${config.API_BASE}/get_medical_shops`;

  useEffect(() => {
    return () => {
      if (apiAbortRef.current) apiAbortRef.current.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const fetchPrivateAPI = useCallback(async (lat, lon) => {
    // Abort previous API call
    if (apiAbortRef.current) {
      apiAbortRef.current.abort();
    }

    const controller = new AbortController();
    apiAbortRef.current = controller;

    setLoading(true);

    try {
      console.log("📍 Sending coordinates:", { lat, lon });

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, longitude: lon }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API ${res.status}: ${text}`);
      }

      const json = await res.json();

      const fetchedPlaces = (json || []).map((p, idx) => ({
        id: p.id || idx,
        lat: p.lat,
        lon: p.lon,
        tags: {
          name: p.name || "Medical Shop",
          address: p.address || "Address not available",
        },
      }));

      setPlaces(fetchedPlaces);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("API error:", err);
        Alert.alert("Server Error", "Could not fetch nearby medical shops.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Get Location and Fetch Data ---
  const getLocationAndFetch = useCallback(async () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setPlaces([]);

        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Location permission is required.",
          );
          return;
        }

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const { latitude, longitude } = loc.coords;

        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });

        fetchPrivateAPI(latitude, longitude);
      } catch (err) {
        console.error("Location error:", err);
        Alert.alert("Error", "Could not get location.");
      }
    }, 500); // ⏱️ debounce delay
  }, [fetchPrivateAPI]);

  useEffect(() => {
    getLocationAndFetch();
  }, []);

  const openInMaps = () => {
    if (!selectedPlace) return;
    const { lat, lon, tags } = selectedPlace;
    const label = tags?.name || "Pharmacy";
    const scheme =
      Platform.OS === "ios"
        ? `http://maps.apple.com/?daddr=${lat},${lon}&dirflg=d`
        : `geo:0,0?q=${lat},${lon}(${label})`;
    Linking.openURL(scheme).catch(() =>
      Alert.alert("Error", "Could not open maps app."),
    );
  };

  return (
    <View style={[styles.container, isDark ? styles.darkBg : styles.lightBg]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View style={styles.headerRow}>
        <Text
          style={[
            styles.header,
            isDark ? styles.headerDark : styles.headerLight,
          ]}
        >
          Nearest Medical Shops
        </Text>
        <TouchableOpacity
          onPress={getLocationAndFetch}
          style={[styles.refreshBtn, loading && styles.refreshBtnLoading]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color={isDark ? "#fff" : "#0EA5A4"}
              style={{ marginRight: 0 }}
            />
          ) : (
            <Ionicons
              name="refresh-circle"
              size={30}
              color={isDark ? "#fff" : "#0EA5A4"}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Map */}
      {region && (
        <View style={styles.innerContainer}>
          <MapView
            style={styles.map}
            region={region}
            showsUserLocation
            showsMyLocationButton
            customMapStyle={isDark ? DARK_MAP_STYLE : []}
            provider={
              Platform.OS === "android" ? MapView.PROVIDER_GOOGLE : undefined
            }
          >
            {places.map((p, index) => (
              <Marker
                key={`${p.id}_${index}`}
                coordinate={{ latitude: p.lat, longitude: p.lon }}
                title={p.tags.name || "Medicine Shop"}
                description={p.tags.address || "Pharmacy nearby"}
                onPress={() => setSelectedPlace(p)}
              >
                <View style={styles.marker}>
                  <Text style={styles.markerText}>💊</Text>
                </View>
              </Marker>
            ))}
          </MapView>

          {selectedPlace && Platform.OS === "ios" && (
            <TouchableOpacity style={styles.fab} onPress={openInMaps}>
              <Text style={styles.fabText}>
                Directions to {selectedPlace.tags?.name || "Pharmacy"} ➡️
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Loader Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={isDark ? "#fff" : "#007AFF"} />
          <Text style={{ marginTop: 8, color: isDark ? "#fff" : "#333" }}>
            Loading nearby medical shops...
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 12,
  },
  header: { fontSize: 22, fontWeight: "700" },
  innerContainer: { flex: 1, borderRadius: 12, overflow: "hidden" },
  map: { flex: 1 },
  loadingOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
    zIndex: 20,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 30,
    elevation: 4,
  },
  fabText: { color: "#fff", fontWeight: "bold" },
  marker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e11d48",
    justifyContent: "center",
    alignItems: "center",
  },
  markerText: { color: "#fff", fontWeight: "bold" },
  darkBg: { backgroundColor: "#000000" },
  lightBg: { backgroundColor: "#F0FDF4" },
  headerLight: { color: "#1F2937" },
  headerDark: { color: "#F3F4F6" },
  refreshBtn: { marginRight: 8, paddingVertical: 2 },
  refreshBtnLoading: { opacity: 0.6 },
});