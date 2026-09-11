import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  useColorScheme,
  Alert,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import config from "../../config";

type Place = {
  id: string | number;
  lat: number;
  lon: number;
  tags: {
    name: string;
    address: string;
  };
};

export default function MapsWeb() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const apiAbortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const API_URL = `${config.API_BASE}/get_medical_shops`;

  useEffect(() => {
    return () => {
      if (apiAbortRef.current) {
        apiAbortRef.current.abort();
      }

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const fetchPrivateAPI = useCallback(
    async (lat: number, lon: number) => {
      if (apiAbortRef.current) {
        apiAbortRef.current.abort();
      }

      const controller = new AbortController();
      apiAbortRef.current = controller;

      setLoading(true);

      try {
        console.log("📍 Sending coordinates:", {
          lat,
          lon,
        });

        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            latitude: lat,
            longitude: lon,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`API ${response.status}: ${text}`);
        }

        const json = await response.json();

        const fetchedPlaces: Place[] = (json || [])
          .map((p: any, index: number) => ({
            id: p.id || index,
            lat: Number(p.lat),
            lon: Number(p.lon),
            tags: {
              name: p.name || "Medical Shop",
              address: p.address || "Address not available",
            },
          }))
          .filter(
            (p: Place) =>
              Number.isFinite(p.lat) && Number.isFinite(p.lon)
          );

        setPlaces(fetchedPlaces);

        console.log(
          `🏥 Found ${fetchedPlaces.length} nearby medical shops`
        );
      } catch (error: any) {
        if (error?.name !== "AbortError") {
          console.error("API error:", error);

          Alert.alert(
            "Server Error",
            "Could not fetch nearby medical shops."
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [API_URL]
  );

  const getLocationAndFetch = useCallback(async () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        setPlaces([]);
        setSelectedPlace(null);

        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setLoading(false);

          Alert.alert(
            "Permission Required",
            "Location permission is required to find nearby medical shops."
          );

          return;
        }

        const currentLocation =
          await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });

        const { latitude, longitude } =
          currentLocation.coords;

        setLocation({
          latitude,
          longitude,
        });

        await fetchPrivateAPI(latitude, longitude);
      } catch (error) {
        console.error("Location error:", error);

        setLoading(false);

        Alert.alert(
          "Location Error",
          "Could not get your current location."
        );
      }
    }, 500);
  }, [fetchPrivateAPI]);

  useEffect(() => {
    getLocationAndFetch();

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [getLocationAndFetch]);

  const openPlaceInMaps = (place: Place) => {
    const { lat, lon, tags } = place;

    const label = encodeURIComponent(
      tags?.name || "Medical Shop"
    );

    let url = "";

    if (Platform.OS === "web") {
      url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}&query_place_id=${label}`;
    } else if (Platform.OS === "ios") {
      url = `http://maps.apple.com/?daddr=${lat},${lon}&dirflg=d`;
    } else {
      url = `geo:0,0?q=${lat},${lon}(${label})`;
    }

    Linking.openURL(url).catch(() => {
      Alert.alert(
        "Error",
        "Could not open maps."
      );
    });
  };

  const openCurrentLocationInMaps = () => {
    if (!location) {
      Alert.alert(
        "Location Unavailable",
        "Your current location is not available yet."
      );

      return;
    }

    const { latitude, longitude } = location;

    const url =
      `https://www.google.com/maps/search/?api=1&query=` +
      `${latitude},${longitude}`;

    Linking.openURL(url).catch(() => {
      Alert.alert(
        "Error",
        "Could not open Google Maps."
      );
    });
  };

  return (
    <View
      style={[
        styles.container,
        isDark ? styles.darkBg : styles.lightBg,
      ]}
    >
      <StatusBar
        style={isDark ? "light" : "dark"}
      />

      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerContent}>
          <Text
            style={[
              styles.header,
              isDark
                ? styles.headerDark
                : styles.headerLight,
            ]}
          >
            Nearest Medical Shops
          </Text>

          <Text
            style={[
              styles.subtitle,
              isDark
                ? styles.subtitleDark
                : styles.subtitleLight,
            ]}
          >
            Find nearby pharmacies using your location
          </Text>
        </View>

        <TouchableOpacity
          onPress={getLocationAndFetch}
          style={[
            styles.refreshBtn,
            isDark
              ? styles.refreshBtnDark
              : styles.refreshBtnLight,
            loading && styles.refreshBtnLoading,
          ]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color={isDark ? "#FFFFFF" : "#0EA5A4"}
            />
          ) : (
            <Ionicons
              name="refresh-circle"
              size={32}
              color={
                isDark ? "#FFFFFF" : "#0EA5A4"
              }
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Web Map Notice */}
      <View
        style={[
          styles.webNotice,
          isDark
            ? styles.webNoticeDark
            : styles.webNoticeLight,
        ]}
      >
        <View
          style={[
            styles.iconCircle,
            isDark
              ? styles.iconCircleDark
              : styles.iconCircleLight,
          ]}
        >
          <Ionicons
            name="map-outline"
            size={34}
            color={isDark ? "#FFFFFF" : "#0EA5A4"}
          />
        </View>

        <Text
          style={[
            styles.webTitle,
            isDark
              ? styles.webTitleDark
              : styles.webTitleLight,
          ]}
        >
          Maps are available on Android & iOS
        </Text>

        <Text
          style={[
            styles.webDescription,
            isDark
              ? styles.webDescriptionDark
              : styles.webDescriptionLight,
          ]}
        >
          The interactive map is available in the
          mobile app. On Web, you can still view
          nearby medical shops and open their
          locations in Google Maps.
        </Text>

        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={openCurrentLocationInMaps}
          disabled={!location}
        >
          <Ionicons
            name="navigate"
            size={20}
            color="#FFFFFF"
          />

          <Text style={styles.currentLocationText}>
            Open My Location
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading */}
      {loading && (
        <View
          style={[
            styles.loadingContainer,
            isDark
              ? styles.loadingContainerDark
              : styles.loadingContainerLight,
          ]}
        >
          <ActivityIndicator
            size="large"
            color={
              isDark ? "#FFFFFF" : "#0EA5A4"
            }
          />

          <Text
            style={[
              styles.loadingText,
              isDark
                ? styles.loadingTextDark
                : styles.loadingTextLight,
            ]}
          >
            Finding nearby medical shops...
          </Text>
        </View>
      )}

      {/* Location Info */}
      {location && !loading && (
        <View
          style={[
            styles.locationCard,
            isDark
              ? styles.locationCardDark
              : styles.locationCardLight,
          ]}
        >
          <View style={styles.locationIcon}>
            <Ionicons
              name="location"
              size={22}
              color="#2563EB"
            />
          </View>

          <View style={styles.locationInfo}>
            <Text
              style={[
                styles.locationTitle,
                isDark
                  ? styles.locationTitleDark
                  : styles.locationTitleLight,
              ]}
            >
              Your Current Location
            </Text>

            <Text
              style={[
                styles.coordinates,
                isDark
                  ? styles.coordinatesDark
                  : styles.coordinatesLight,
              ]}
            >
              {location.latitude.toFixed(6)},{" "}
              {location.longitude.toFixed(6)}
            </Text>
          </View>
        </View>
      )}

      {/* Places */}
      {!loading && places.length > 0 && (
        <View style={styles.placesContainer}>
          <Text
            style={[
              styles.resultsTitle,
              isDark
                ? styles.resultsTitleDark
                : styles.resultsTitleLight,
            ]}
          >
            Nearby Medical Shops ({places.length})
          </Text>

          {places.map((place, index) => {
            const isSelected =
              selectedPlace?.id === place.id;

            return (
              <TouchableOpacity
                key={`${place.id}_${index}`}
                style={[
                  styles.placeCard,
                  isDark
                    ? styles.placeCardDark
                    : styles.placeCardLight,
                  isSelected &&
                    styles.placeCardSelected,
                ]}
                onPress={() => {
                  setSelectedPlace(place);
                }}
                activeOpacity={0.8}
              >
                {/* Medicine Icon */}
                <View style={styles.marker}>
                  <Text style={styles.markerText}>
                    💊
                  </Text>
                </View>

                {/* Details */}
                <View style={styles.placeDetails}>
                  <Text
                    style={[
                      styles.placeName,
                      isDark
                        ? styles.placeNameDark
                        : styles.placeNameLight,
                    ]}
                    numberOfLines={2}
                  >
                    {place.tags?.name ||
                      "Medical Shop"}
                  </Text>

                  <Text
                    style={[
                      styles.placeAddress,
                      isDark
                        ? styles.placeAddressDark
                        : styles.placeAddressLight,
                    ]}
                    numberOfLines={2}
                  >
                    {place.tags?.address ||
                      "Address not available"}
                  </Text>

                  <Text
                    style={[
                      styles.coordinatesSmall,
                      isDark
                        ? styles.coordinatesSmallDark
                        : styles.coordinatesSmallLight,
                    ]}
                  >
                    {place.lat.toFixed(5)},{" "}
                    {place.lon.toFixed(5)}
                  </Text>
                </View>

                {/* Arrow */}
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={
                    isDark
                      ? "#9CA3AF"
                      : "#6B7280"
                  }
                />
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* No Results */}
      {!loading &&
        location &&
        places.length === 0 && (
          <View
            style={[
              styles.emptyContainer,
              isDark
                ? styles.emptyContainerDark
                : styles.emptyContainerLight,
            ]}
          >
            <Ionicons
              name="medical-outline"
              size={48}
              color={
                isDark ? "#9CA3AF" : "#6B7280"
              }
            />

            <Text
              style={[
                styles.emptyTitle,
                isDark
                  ? styles.emptyTitleDark
                  : styles.emptyTitleLight,
              ]}
            >
              No Medical Shops Found
            </Text>

            <Text
              style={[
                styles.emptyText,
                isDark
                  ? styles.emptyTextDark
                  : styles.emptyTextLight,
              ]}
            >
              We couldn&apos;t find any medical shops
              near your current location.
            </Text>
          </View>
        )}

      {/* Selected Place */}
      {selectedPlace && (
        <View
          style={[
            styles.selectedCard,
            isDark
              ? styles.selectedCardDark
              : styles.selectedCardLight,
          ]}
        >
          <View style={styles.selectedHeader}>
            <View style={styles.selectedTitleContainer}>
              <Text style={styles.selectedEmoji}>
                💊
              </Text>

              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.selectedTitle,
                    isDark
                      ? styles.selectedTitleDark
                      : styles.selectedTitleLight,
                  ]}
                  numberOfLines={1}
                >
                  {selectedPlace.tags?.name ||
                    "Medical Shop"}
                </Text>

                <Text
                  style={[
                    styles.selectedAddress,
                    isDark
                      ? styles.selectedAddressDark
                      : styles.selectedAddressLight,
                  ]}
                  numberOfLines={2}
                >
                  {selectedPlace.tags?.address ||
                    "Address not available"}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() =>
                setSelectedPlace(null)
              }
            >
              <Ionicons
                name="close-circle"
                size={28}
                color={
                  isDark
                    ? "#9CA3AF"
                    : "#6B7280"
                }
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.directionsButton}
            onPress={() =>
              openPlaceInMaps(selectedPlace)
            }
          >
            <Ionicons
              name="navigate"
              size={20}
              color="#FFFFFF"
            />

            <Text style={styles.directionsText}>
              Open in Google Maps
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  /* Background */
  darkBg: {
    backgroundColor: "#000000",
  },

  lightBg: {
    backgroundColor: "#F0FDF4",
  },

  /* Header */
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 16,
  },

  headerContent: {
    flex: 1,
    paddingRight: 10,
  },

  header: {
    fontSize: 22,
    fontWeight: "700",
  },

  headerLight: {
    color: "#1F2937",
  },

  headerDark: {
    color: "#F3F4F6",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
  },

  subtitleLight: {
    color: "#6B7280",
  },

  subtitleDark: {
    color: "#9CA3AF",
  },

  refreshBtn: {
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 21,
  },

  refreshBtnLight: {
    backgroundColor: "#DCFCE7",
  },

  refreshBtnDark: {
    backgroundColor: "#1F2937",
  },

  refreshBtnLoading: {
    opacity: 0.6,
  },

  /* Web Notice */
  webNotice: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },

  webNoticeLight: {
    backgroundColor: "#FFFFFF",
  },

  webNoticeDark: {
    backgroundColor: "#111827",
  },

  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  iconCircleLight: {
    backgroundColor: "#DCFCE7",
  },

  iconCircleDark: {
    backgroundColor: "#374151",
  },

  webTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },

  webTitleLight: {
    color: "#1F2937",
  },

  webTitleDark: {
    color: "#F9FAFB",
  },

  webDescription: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    maxWidth: 600,
    marginBottom: 18,
  },

  webDescriptionLight: {
    color: "#6B7280",
  },

  webDescriptionDark: {
    color: "#9CA3AF",
  },

  currentLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
  },

  currentLocationText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 8,
  },

  /* Loading */
  loadingContainer: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },

  loadingContainerLight: {
    backgroundColor: "#FFFFFF",
  },

  loadingContainerDark: {
    backgroundColor: "#111827",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },

  loadingTextLight: {
    color: "#374151",
  },

  loadingTextDark: {
    color: "#F3F4F6",
  },

  /* Location */
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },

  locationCardLight: {
    backgroundColor: "#FFFFFF",
  },

  locationCardDark: {
    backgroundColor: "#111827",
  },

  locationIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  locationInfo: {
    flex: 1,
  },

  locationTitle: {
    fontSize: 14,
    fontWeight: "700",
  },

  locationTitleLight: {
    color: "#1F2937",
  },

  locationTitleDark: {
    color: "#F9FAFB",
  },

  coordinates: {
    marginTop: 3,
    fontSize: 12,
  },

  coordinatesLight: {
    color: "#6B7280",
  },

  coordinatesDark: {
    color: "#9CA3AF",
  },

  /* Results */
  placesContainer: {
    flex: 1,
  },

  resultsTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 10,
  },

  resultsTitleLight: {
    color: "#1F2937",
  },

  resultsTitleDark: {
    color: "#F9FAFB",
  },

  /* Place Card */
  placeCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },

  placeCardLight: {
    backgroundColor: "#FFFFFF",
  },

  placeCardDark: {
    backgroundColor: "#111827",
  },

  placeCardSelected: {
    borderWidth: 2,
    borderColor: "#2563EB",
  },

  marker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E11D48",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  markerText: {
    fontSize: 21,
  },

  placeDetails: {
    flex: 1,
  },

  placeName: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 3,
  },

  placeNameLight: {
    color: "#1F2937",
  },

  placeNameDark: {
    color: "#F9FAFB",
  },

  placeAddress: {
    fontSize: 13,
    lineHeight: 18,
  },

  placeAddressLight: {
    color: "#6B7280",
  },

  placeAddressDark: {
    color: "#9CA3AF",
  },

  coordinatesSmall: {
    fontSize: 10,
    marginTop: 4,
  },

  coordinatesSmallLight: {
    color: "#9CA3AF",
  },

  coordinatesSmallDark: {
    color: "#6B7280",
  },

  /* Empty */
  emptyContainer: {
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
  },

  emptyContainerLight: {
    backgroundColor: "#FFFFFF",
  },

  emptyContainerDark: {
    backgroundColor: "#111827",
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginTop: 12,
  },

  emptyTitleLight: {
    color: "#1F2937",
  },

  emptyTitleDark: {
    color: "#F9FAFB",
  },

  emptyText: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 6,
  },

  emptyTextLight: {
    color: "#6B7280",
  },

  emptyTextDark: {
    color: "#9CA3AF",
  },

  /* Selected Place */
  selectedCard: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 5,
  },

  selectedCardLight: {
    backgroundColor: "#FFFFFF",
  },

  selectedCardDark: {
    backgroundColor: "#1F2937",
  },

  selectedHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  selectedTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },

  selectedEmoji: {
    fontSize: 28,
    marginRight: 10,
  },

  selectedTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  selectedTitleLight: {
    color: "#1F2937",
  },

  selectedTitleDark: {
    color: "#F9FAFB",
  },

  selectedAddress: {
    fontSize: 12,
    marginTop: 3,
  },

  selectedAddressLight: {
    color: "#6B7280",
  },

  selectedAddressDark: {
    color: "#9CA3AF",
  },

  directionsButton: {
    height: 46,
    borderRadius: 23,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  directionsText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 8,
  },
});