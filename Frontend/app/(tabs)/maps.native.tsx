import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  TouchableOpacity,
  Linking,
} from "react-native";

import MapView, {
  Marker,
  PROVIDER_GOOGLE,
} from "react-native-maps";

import * as Location from "expo-location";

import { StatusBar } from "expo-status-bar";

import { Ionicons } from "@expo/vector-icons";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import config from "../../config";

import { useTheme } from "../../constants/theme";
import { SPACING } from "../../constants/spacing";
import { useTranslation } from "../../constants/i18n";

/* =========================================================
   DARK GOOGLE MAP STYLE
   ========================================================= */

const DARK_MAP_STYLE = [
  {
    elementType: "geometry",
    stylers: [{ color: "#242f3e" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#242f3e" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#746855" }],
  },
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

/* =========================================================
   TYPES
   ========================================================= */

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type MedicalShop = {
  id: string | number;
  lat: number;
  lon: number;
  tags: {
    name: string;
    address: string;
  };
};

/* =========================================================
   COMPONENT
   ========================================================= */

export default function Maps() {
  const { colors, isDark } = useTheme();

  const { t } = useTranslation();

  const insets = useSafeAreaInsets();

  const [region, setRegion] =
    useState<Region | null>(null);

  const [places, setPlaces] =
    useState<MedicalShop[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [selectedPlace, setSelectedPlace] =
    useState<MedicalShop | null>(null);

  const apiAbortRef =
    useRef<AbortController | null>(null);

  const debounceRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const dynamicStyles = styles(
    colors,
    insets
  );

  const API_URL =
    `${config.API_BASE}/get_medical_shops`;

  /* =========================================================
     CLEANUP
     ========================================================= */

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

  /* =========================================================
     NORMALIZE API RESPONSE
     ========================================================= */

  const normalizeMedicalShops = (
    json: any
  ): MedicalShop[] => {
    let rawPlaces: any[] = [];

    if (Array.isArray(json)) {
      rawPlaces = json;
    } else if (Array.isArray(json?.shops)) {
      rawPlaces = json.shops;
    } else if (Array.isArray(json?.data)) {
      rawPlaces = json.data;
    } else if (Array.isArray(json?.results)) {
      rawPlaces = json.results;
    } else if (
      Array.isArray(json?.medical_shops)
    ) {
      rawPlaces = json.medical_shops;
    } else {
      console.log(
        "⚠️ Could not find medical shop array in API response."
      );

      return [];
    }

    const normalized: MedicalShop[] =
      rawPlaces
        .map(
          (
            p: any,
            index: number
          ) => {
            const rawLat =
              p?.lat ??
              p?.latitude ??
              p?.tags?.lat ??
              p?.tags?.latitude;

            const rawLon =
              p?.lon ??
              p?.lng ??
              p?.longitude ??
              p?.tags?.lon ??
              p?.tags?.lng ??
              p?.tags?.longitude;

            const lat = Number(rawLat);
            const lon = Number(rawLon);

            const name =
              p?.name ??
              p?.tags?.name ??
              p?.shop_name ??
              p?.title ??
              t("maps.medicalShop");

            const address =
              p?.address ??
              p?.tags?.address ??
              p?.display_name ??
              p?.formatted_address ??
              t("maps.addressNotAvailable");

            return {
              id:
                p?.id ??
                p?.osm_id ??
                p?.place_id ??
                index,

              lat,
              lon,

              tags: {
                name: String(name),
                address: String(address),
              },
            };
          }
        )
        .filter(
          (p: MedicalShop) =>
            Number.isFinite(p.lat) &&
            Number.isFinite(p.lon) &&
            p.lat >= -90 &&
            p.lat <= 90 &&
            p.lon >= -180 &&
            p.lon <= 180
        );

    return normalized;
  };

  /* =========================================================
     FETCH MEDICAL SHOPS
     ========================================================= */

  const fetchPrivateAPI =
    useCallback(
      async (
        latitude: number,
        longitude: number
      ) => {
        if (apiAbortRef.current) {
          apiAbortRef.current.abort();
        }

        const controller =
          new AbortController();

        apiAbortRef.current =
          controller;

        setLoading(true);

        try {
          const res = await fetch(
            API_URL,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                latitude,
                longitude,
              }),

              signal:
                controller.signal,
            }
          );

          if (!res.ok) {
            const text =
              await res.text();

            throw new Error(
              `API ${res.status}: ${text}`
            );
          }

          const json =
            await res.json();

          const fetchedPlaces =
            normalizeMedicalShops(
              json
            );

          setPlaces(
            fetchedPlaces
          );

          if (
            fetchedPlaces.length === 0
          ) {
            console.log(
              "⚠️ API returned zero valid medical shops."
            );
          }
        } catch (error: any) {
          if (
            error?.name !==
            "AbortError"
          ) {
            console.error(
              "❌ Medical shop API error:",
              error
            );

            Alert.alert(
              t("common.serverError"),
              t("maps.fetchError")
            );
          }
        } finally {
          if (
            apiAbortRef.current ===
            controller
          ) {
            setLoading(false);
          }
        }
      },
      [API_URL, t]
    );

  /* =========================================================
     GET LOCATION + FETCH

     Strategy:

       1. Grab a last-known position so
          the map mounts quickly.

       2. Request a fresh balanced-accuracy
          location in the background.

       3. Update the map and fetch nearby
          medical shops.
     ========================================================= */

  const getLocationAndFetch =
    useCallback(() => {
      if (debounceRef.current) {
        clearTimeout(
          debounceRef.current
        );
      }

      debounceRef.current =
        setTimeout(
          async () => {
            try {
              setPlaces([]);
              setSelectedPlace(null);

              const {
                status,
              } =
                await Location.requestForegroundPermissionsAsync();

              if (
                status !== "granted"
              ) {
                Alert.alert(
                  t(
                    "maps.permissionRequired"
                  ),
                  t(
                    "maps.locationPermission"
                  )
                );

                return;
              }

              // -------------------------------------------------
              // STEP 1:
              // Use cached location if available.
              // -------------------------------------------------

              let coarse =
                await Location.getLastKnownPositionAsync();

              if (coarse) {
                setRegion({
                  latitude:
                    coarse.coords
                      .latitude,

                  longitude:
                    coarse.coords
                      .longitude,

                  latitudeDelta:
                    0.035,

                  longitudeDelta:
                    0.035,
                });
              }

              // -------------------------------------------------
              // STEP 2:
              // Get fresh location.
              // -------------------------------------------------

              const location =
                await Location.getCurrentPositionAsync(
                  {
                    accuracy:
                      Location.Accuracy
                        .Balanced,
                  }
                );

              const {
                latitude,
                longitude,
              } = location.coords;

              const newRegion: Region =
                {
                  latitude,
                  longitude,
                  latitudeDelta:
                    0.035,
                  longitudeDelta:
                    0.035,
                };

              setRegion(
                newRegion
              );

              await fetchPrivateAPI(
                latitude,
                longitude
              );
            } catch (error) {
              console.error(
                "❌ Location error:",
                error
              );

              Alert.alert(
                t("common.error"),
                t("maps.locationError")
              );
            }
          },
          300
        );
    }, [
      fetchPrivateAPI,
      t,
    ]);

  /* =========================================================
     INITIAL LOAD
     ========================================================= */

  useEffect(() => {
    getLocationAndFetch();

    return () => {
      if (debounceRef.current) {
        clearTimeout(
          debounceRef.current
        );
      }
    };
  }, [getLocationAndFetch]);

  /* =========================================================
     OPEN EXTERNAL MAPS
     ========================================================= */

  const openInMaps = () => {
    if (!selectedPlace) {
      return;
    }

    const {
      lat,
      lon,
      tags,
    } = selectedPlace;

    const label =
      tags?.name ||
      t("maps.pharmacy");

    const scheme =
      Platform.OS === "ios"
        ? `http://maps.apple.com/?daddr=${lat},${lon}&dirflg=d`
        : `geo:0,0?q=${lat},${lon}(${encodeURIComponent(
            label
          )})`;

    Linking.openURL(
      scheme
    ).catch(() => {
      Alert.alert(
        t("common.error"),
        t("maps.openMapsError")
      );
    });
  };

  /* =========================================================
     UI
     ========================================================= */

  return (
    <View
      style={[
        dynamicStyles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >
      <StatusBar
        style={
          isDark
            ? "light"
            : "dark"
        }
      />

      {/* =====================================================
          HEADER
          ===================================================== */}

      <View
        style={
          dynamicStyles.headerRow
        }
      >
        <View
          style={
            dynamicStyles.headerTextGroup
          }
        >
          <Text
            style={[
              dynamicStyles.header,
              {
                color:
                  colors.text,
              },
            ]}
          >
            {t(
              "maps.title"
            )}
          </Text>

          <Text
            style={[
              dynamicStyles.subtitle,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            {t(
              "maps.subtitle"
            )}
          </Text>
        </View>

        {/* =================================================
            REFRESH BUTTON
            ================================================= */}

        <TouchableOpacity
          onPress={
            getLocationAndFetch
          }
          disabled={loading}
          activeOpacity={0.7}
          style={[
            dynamicStyles.refreshBtn,
            {
              backgroundColor:
                colors.surface,

              borderColor:
                colors.border,
            },

            loading &&
              dynamicStyles.refreshBtnLoading,
          ]}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color={
                colors.primary
              }
            />
          ) : (
            <Ionicons
              name="refresh-circle"
              size={30}
              color={
                colors.primary
              }
            />
          )}
        </TouchableOpacity>
      </View>

      {/* =====================================================
          MAP CONTAINER
          ===================================================== */}

      <View
        style={[
          dynamicStyles.mapContainer,
          {
            backgroundColor:
              colors.surface,

            borderColor:
              colors.border,
          },
        ]}
      >
        {region ? (
          <MapView
            key={
              isDark
                ? "google-map-dark"
                : "google-map-light"
            }
            style={
              dynamicStyles.map
            }
            region={
              region
            }
            showsUserLocation
            showsMyLocationButton
            loadingEnabled
            toolbarEnabled
            customMapStyle={
              isDark
                ? DARK_MAP_STYLE
                : []
            }
            provider={
              Platform.OS ===
              "android"
                ? PROVIDER_GOOGLE
                : undefined
            }
          >
            {places.map(
              (
                place,
                index
              ) => (
                <Marker
                  key={`${place.id}-${index}`}
                  coordinate={{
                    latitude:
                      place.lat,

                    longitude:
                      place.lon,
                  }}
                  title={
                    place.tags?.name ||
                    t(
                      "maps.medicalShop"
                    )
                  }
                  description={
                    place.tags
                      ?.address ||
                    t(
                      "maps.pharmacyNearby"
                    )
                  }
                  onPress={() =>
                    setSelectedPlace(
                      place
                    )
                  }
                  tracksViewChanges={
                    false
                  }
                >
                  <View
                    style={[
                      dynamicStyles.marker,
                      {
                        backgroundColor:
                          "#E11D48",

                        borderColor:
                          colors.surface,
                      },
                    ]}
                  >
                    <Text
                      style={
                        dynamicStyles.markerText
                      }
                    >
                      💊
                    </Text>
                  </View>
                </Marker>
              )
            )}
          </MapView>
        ) : (
          <View
            style={[
              dynamicStyles.initialLoader,
              {
                backgroundColor:
                  colors.surface,
              },
            ]}
          >
            <ActivityIndicator
              size="large"
              color={
                colors.primary
              }
            />

            <Text
              style={[
                dynamicStyles.initialLoaderText,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              {t(
                "maps.gettingLocation"
              )}
            </Text>
          </View>
        )}

        {/* =====================================================
            IOS DIRECTIONS
            ===================================================== */}

        {selectedPlace &&
          Platform.OS === "ios" && (
            <TouchableOpacity
              style={[
                dynamicStyles.fab,
                {
                  backgroundColor:
                    colors.primary,
                },
              ]}
              onPress={
                openInMaps
              }
              activeOpacity={0.85}
            >
              <Ionicons
                name="navigate"
                size={18}
                color={
                  colors.white
                }
              />

              <Text
                style={
                  dynamicStyles.fabText
                }
                numberOfLines={1}
              >
                {t(
                  "maps.directionsTo",
                  {
                    name:
                      selectedPlace
                        .tags
                        ?.name ||
                      t(
                        "maps.pharmacy"
                      ),
                  }
                )}
              </Text>

              <Ionicons
                name="arrow-forward"
                size={18}
                color={
                  colors.white
                }
              />
            </TouchableOpacity>
          )}
      </View>

      {/* =====================================================
          LOADING OVERLAY
          ===================================================== */}

      {loading && (
        <View
          pointerEvents="auto"
          style={[
            dynamicStyles.loadingOverlay,
            {
              backgroundColor:
                colors.overlay,
            },
          ]}
        >
          <View
            style={[
              dynamicStyles.loadingCard,
              {
                backgroundColor:
                  colors.surface,

                borderColor:
                  colors.border,
              },
            ]}
          >
            <ActivityIndicator
              size="large"
              color={
                colors.primary
              }
            />

            <Text
              style={[
                dynamicStyles.loadingText,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {t(
                "maps.loadingShops"
              )}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

/* =========================================================
   STYLES
   ========================================================= */

const styles = (
  colors: any,
  insets: {
    top: number;
    bottom: number;
  }
) =>
  StyleSheet.create({
    /* =======================================================
       SCREEN
       ======================================================= */

    container: {
      flex: 1,

      paddingHorizontal:
        SPACING.screenHorizontal,

      paddingTop: Math.max(
        SPACING.md,
        insets.top +
          SPACING.xs
      ),

      paddingBottom:
        insets.bottom > 0
          ? insets.bottom
          : SPACING.sm,
    },

    /* =======================================================
       HEADER
       ======================================================= */

    headerRow: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",

      marginBottom:
        SPACING.md,
    },

    headerTextGroup: {
      flex: 1,

      paddingRight:
        SPACING.md,
    },

    header: {
      fontSize: 28,

      fontWeight:
        "800",

      letterSpacing:
        0.1,
    },

    subtitle: {
      marginTop:
        SPACING.xs,

      fontSize: 14,

      lineHeight: 20,
    },

    /* =======================================================
       REFRESH BUTTON
       ======================================================= */

    refreshBtn: {
      width: 42,

      height: 42,

      borderRadius: 21,

      justifyContent:
        "center",

      alignItems:
        "center",

      borderWidth: 1,

      marginLeft:
        SPACING.md,

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity:
        0.08,

      shadowRadius:
        4,

      elevation: 2,
    },

    refreshBtnLoading: {
      opacity: 0.6,
    },

    /* =======================================================
       MAP CONTAINER
       ======================================================= */

    mapContainer: {
      flex: 1,

      width: "100%",

      minHeight: 1,

      borderRadius: 12,

      overflow: "hidden",

      borderWidth: 1,

      position:
        "relative",
    },

    /* =======================================================
       MAP
       ======================================================= */

    map: {
      flex: 1,
    },

    /* =======================================================
       INITIAL LOADER
       ======================================================= */

    initialLoader: {
      flex: 1,

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    initialLoaderText: {
      marginTop:
        SPACING.md,

      fontSize: 14,

      fontWeight:
        "500",
    },

    /* =======================================================
       MEDICAL SHOP MARKER
       ======================================================= */

    marker: {
      width: 28,

      height: 28,

      borderRadius: 14,

      justifyContent:
        "center",

      alignItems:
        "center",

      borderWidth: 2,

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity:
        0.25,

      shadowRadius:
        3,

      elevation: 5,
    },

    markerText: {
      color:
        "#FFFFFF",

      fontSize: 15,

      fontWeight:
        "bold",

      textAlign:
        "center",
    },

    /* =======================================================
       IOS DIRECTIONS
       ======================================================= */

    fab: {
      position:
        "absolute",

      left:
        SPACING.lg,

      right:
        SPACING.lg,

      bottom:
        SPACING.lg,

      minHeight: 48,

      paddingVertical:
        SPACING.md,

      paddingHorizontal:
        SPACING.lg,

      borderRadius: 24,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap:
        SPACING.sm,

      shadowOffset: {
        width: 0,
        height: 3,
      },

      shadowOpacity:
        0.25,

      shadowRadius:
        5,

      elevation: 5,
    },

    fabText: {
      color:
        "#FFFFFF",

      fontSize: 14,

      fontWeight:
        "700",

      flexShrink: 1,

      textAlign:
        "center",
    },

    /* =======================================================
       LOADING OVERLAY
       ======================================================= */

    loadingOverlay: {
      position:
        "absolute",

      left: 0,

      right: 0,

      top: 0,

      bottom: 0,

      justifyContent:
        "center",

      alignItems:
        "center",

      zIndex: 20,
    },

    loadingCard: {
      minWidth: 210,

      paddingVertical:
        SPACING.xl,

      paddingHorizontal:
        SPACING.xxl,

      borderRadius: 16,

      alignItems:
        "center",

      borderWidth: 1,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      shadowOpacity:
        0.2,

      shadowRadius:
        8,

      elevation: 6,
    },

    loadingText: {
      marginTop:
        SPACING.md,

      fontSize: 14,

      fontWeight:
        "600",

      textAlign:
        "center",
    },
  });