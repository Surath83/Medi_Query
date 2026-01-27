import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
  Alert,
  Platform,
  useColorScheme,
  KeyboardAvoidingView,
  Share,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import * as Notifications from "expo-notifications";

const STORAGE_KEY = "@reminders_v1";
const PRESET_TIMES = {
  breakfast: { hour: 8, minute: 0 },
  lunch: { hour: 13, minute: 0 },
  dinner: { hour: 20, minute: 0 },
};
const TIME_OPTIONS = [
  { key: "breakfast", label: "Breakfast (8:00)" },
  { key: "lunch", label: "Lunch (13:00)" },
  { key: "dinner", label: "Dinner (20:00)" },
  { key: "custom", label: "Custom" },
];

// Compute notification date
function computeNotificationDate(baseDate, hour, minute, offsetMinutes = 0) {
  const d = baseDate ? new Date(baseDate) : new Date();
  d.setHours(hour);
  d.setMinutes(minute + offsetMinutes);
  d.setSeconds(0);
  d.setMilliseconds(0);
  if (d < new Date()) d.setDate(d.getDate() + 1);
  return d;
}

export default function Reminder() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [first_name, setFirstName] = useState("John");
  const [medicine, setMedicine] = useState("");
  const [timeMode, setTimeMode] = useState("breakfast");
  const [customTime, setCustomTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [beforeAfter, setBeforeAfter] = useState("before");
  const [offset, setOffset] = useState(0);
  const [endDate, setEndDate] = useState(null);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [reminders, setReminders] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const loadName = async () => {
        try {
          const raw = await AsyncStorage.getItem("USER_PROFILE_V1");
          if (raw) {
            const profile = JSON.parse(raw);
            if (profile?.name) setFirstName(profile.name);
          }
        } catch (e) {
          console.error("Failed to load name", e);
        }
      };

      loadName();
    }, []),
  );

  useEffect(() => {
    (async () => {
      // 🔴 STEP 1: Clear old broken notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      // 🟢 STEP 2: Create Android channel FIRST
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("reminders", {
          name: "Medicine Reminders",
          importance: Notifications.AndroidImportance.HIGH,
          sound: "default",
        });
      }

      // 🟢 STEP 3: Ask permission
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Enable notifications.");
        return;
      }

      // 🟢 STEP 4: Notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      // 🟢 STEP 5: Load AFTER everything is ready
      await loadReminders();
    })();
  }, []);

  async function scheduleNotification(reminder) {
    const notifDate = new Date(reminder.date);
    const end = reminder.endDate ? new Date(reminder.endDate) : null;
    const ids = [];

    const baseContent = {
      title: "💊 Reminder",
      body: `Take ${reminder.medicine} (${reminder.beforeAfter} food)`,
      sound: "default",
      channelId: Platform.OS === "android" ? "reminders" : undefined,
    };

    if (end) {
      let d = new Date(notifDate);
      while (d <= end) {
        const id = await Notifications.scheduleNotificationAsync({
          content: baseContent,
          trigger: { date: d },
        });
        ids.push(id);
        d.setDate(d.getDate() + 1);
      }
    } else {
      const id = await Notifications.scheduleNotificationAsync({
        content: baseContent,
        trigger: {
          hour: notifDate.getHours(),
          minute: notifDate.getMinutes(),
          repeats: true,
        },
      });
      ids.push(id);
    }

    return ids;
  }

  async function loadReminders() {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      let list = JSON.parse(raw);
      const now = new Date();
      list = list.map((r) => {
        const d = new Date(r.date);
        if (d < now) {
          if (r.repeat) {
            d.setDate(d.getDate() + 1);
            return { ...r, date: d.toISOString(), status: "pending" };
          } else {
            return { ...r, status: "pending" };
          }
        }
        return r;
      });
      setReminders(list);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
  }

  async function saveReminders(list) {
    setReminders(list);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  async function addReminder() {
    if (!medicine.trim()) {
      Alert.alert("Missing field", "Please enter a medicine name.");
      return;
    }

    let hour, minute;

    if (timeMode === "custom") {
      hour = customTime.getHours();
      minute = customTime.getMinutes();
    } else {
      const preset = PRESET_TIMES[timeMode]; // ✅ always defined
      hour = preset.hour;
      minute = preset.minute;
    }

    const offsetMinutes = (beforeAfter === "before" ? -1 : 1) * offset;
    const notifDate = computeNotificationDate(
      new Date(),
      hour,
      minute,
      offsetMinutes,
    );

    const id = Date.now().toString();
    const reminder = {
      id,
      medicine: medicine.trim(),
      timeMode,
      customTime: timeMode === "custom" ? customTime.toISOString() : null,
      beforeAfter,
      offset,
      endDate: endDate ? endDate.toISOString() : null,
      date: notifDate.toISOString(),
      repeat: !endDate,
      status: "pending",
    };

    const notificationIds = await scheduleNotification(reminder);
    reminder.notificationIds = notificationIds;

    await saveReminders([reminder, ...reminders]);

    setMedicine("");
    setTimeMode("breakfast");
    setCustomTime(new Date());
    setEndDate(null);
  }

  async function deleteReminder(remId) {
    const r = reminders.find((x) => x.id === remId);
    if (r?.notificationIds) {
      for (let id of r.notificationIds) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
    }
    await saveReminders(reminders.filter((x) => x.id !== remId));
  }

  async function markStatus(remId, status) {
    await saveReminders(
      reminders.map((r) => (r.id === remId ? { ...r, status } : r)),
    );
  }

  async function shareReminders() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];

      if (!list.length) {
        Alert.alert("No reminders", "You have no reminders to share.");
        return;
      }

      const text = list
        .map((r, i) => {
          const time = new Date(r.date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return `${i + 1}. ${r.medicine} — ${time} • ${r.beforeAfter} food`;
        })
        .join("\n");

      await Share.share({
        message: `My Medicine Reminders:\n\n${text}`,
      });
    } catch (e) {
      Alert.alert("Share failed", e.message);
    }
  }

  const colors = {
    background: isDark ? "#121212" : "#F0FDF4",
    card: isDark ? "#1E1E1E" : "#ECFEFF",
    input: isDark ? "#2A2A2A" : "#fff",
    text: isDark ? "#E0E0E0" : "#000",
    border: isDark ? "#333" : "#38bdf8",
    chipActive: isDark ? "#0EA5A4" : "#38bdf8",
    chipText: isDark ? "#E0E0E0" : "#444",
    smallBtnBg: isDark ? "#2A2A2A" : "#f1f5f9",
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View style={[styles.container]}>
        <Text style={[styles.header, { color: colors.text }]}>
          Reminder
        </Text>

        {/* SHARE BUTTON */}
        <Pressable style={[styles.shareBtn]} onPress={shareReminders}>
          <Feather name="share-2" size={22} color={isDark ? "#fff" : "#000"} />
        </Pressable>

        {/* Form */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <TextInput
            placeholder="Medicine name"
            placeholderTextColor={colors.chipText}
            style={[
              styles.input,
              {
                backgroundColor: colors.input,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={medicine}
            onChangeText={setMedicine}
          />

          {/* Time selection */}
          <Text style={[styles.label, { color: colors.text }]}>
            Select Time
          </Text>
          <View style={styles.row}>
            {TIME_OPTIONS.map(({ key, label }) => (
              <Pressable
                key={key}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      timeMode === key ? colors.chipActive : colors.input,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => {
                  setTimeMode(key);
                  if (key === "custom") setShowTimePicker(true);
                }}
              >
                <Text
                  style={{
                    color: timeMode === key ? "#fff" : colors.chipText,
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>

          {timeMode === "custom" && showTimePicker && (
            <DateTimePicker
              value={customTime}
              mode="time"
              is24Hour
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(e, date) => {
                setShowTimePicker(false);
                if (date) setCustomTime(date);
              }}
            />
          )}

          {/* Before / After Food */}
          <Text style={[styles.label, { color: colors.text }]}>
            Before / After Food
          </Text>
          <View style={styles.row}>
            {["before", "after"].map((opt) => (
              <Pressable
                key={opt}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      beforeAfter === opt ? colors.chipActive : colors.input,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setBeforeAfter(opt)}
              >
                <Text
                  style={{
                    color: beforeAfter === opt ? "#fff" : colors.chipText,
                  }}
                >
                  {opt}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.row}>
            {[0, 15, 30].map((m) => (
              <Pressable
                key={m}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      offset === m ? colors.chipActive : colors.input,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setOffset(m)}
              >
                <Text
                  style={{ color: offset === m ? "#fff" : colors.chipText }}
                >
                  {m} min
                </Text>
              </Pressable>
            ))}
          </View>

          {/* End Date */}
          <Text style={[styles.label, { color: colors.text }]}>
            End Date (optional)
          </Text>
          <Pressable
            style={[styles.timeBtn, { borderColor: colors.border }]}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Text style={{ color: colors.text }}>
              {endDate ? endDate.toLocaleDateString() : "Select End Date"}
            </Text>
          </Pressable>
          {showEndDatePicker && (
            <DateTimePicker
              value={endDate || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              minimumDate={new Date()}
              onChange={(e, date) => {
                setShowEndDatePicker(false);
                if (date) setEndDate(date);
              }}
            />
          )}

          <Pressable
            style={[styles.saveBtn, { backgroundColor: colors.chipActive }]}
            onPress={addReminder}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              Save Reminder
            </Text>
          </Pressable>
        </View>

        {/* List */}
        <Text style={[styles.sectionHeader, { color: colors.text }]}>
          {first_name}&#39;s Reminders
        </Text>

        <FlatList
          data={Array.isArray(reminders) ? reminders : []}
          keyExtractor={(item) => item?.id ?? Math.random().toString()}
          contentContainerStyle={{ padding: 6, paddingBottom: 16 }}
          style={{ maxHeight: "32%", borderRadius: 18 }}
          ListEmptyComponent={
            <Text style={{ color: colors.text }}>No reminders yet.</Text>
          }
          renderItem={({ item }) => {
            if (!item) return null;
            return (
              <View
                style={[
                  styles.reminderRow,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Pressable
                  style={[
                    styles.smallBtn,
                    { backgroundColor: "#fee2e2", marginRight: 8 },
                  ]}
                  onPress={() => deleteReminder(item.id)}
                >
                  <Text>🗑️</Text>
                </Pressable>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.reminderTitle, { color: colors.text }]}>
                    {item.medicine ?? "Unknown"}
                  </Text>
                  <Text style={[styles.reminderMeta, { color: colors.text }]}>
                    {item.repeat ? "Daily" : "One-time"} •{" "}
                    {item.date ? new Date(item.date).toLocaleString() : "N/A"}
                  </Text>
                  {item.endDate && (
                    <Text style={[styles.reminderMeta, { color: colors.text }]}>
                      Ends: {new Date(item.endDate).toLocaleDateString()}
                    </Text>
                  )}
                  <Text style={[styles.reminderMeta, { color: colors.text }]}>
                    Status: {item.status ?? "pending"}
                  </Text>
                </View>
                <View style={styles.rightButtons}>
                  <Pressable
                    style={[
                      styles.smallBtn,
                      { backgroundColor: colors.smallBtnBg },
                    ]}
                    onPress={() => markStatus(item.id, "taken")}
                  >
                    <Text>✅</Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.smallBtn,
                      { backgroundColor: colors.smallBtnBg },
                    ]}
                    onPress={() => markStatus(item.id, "missed")}
                  >
                    <Text>❌</Text>
                  </Pressable>
                </View>
              </View>
            );
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, paddingBottom: 60 },
  header: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "left",
    marginTop: 20,
    paddingBottom: 12,
  },
  shareBtn: {
    marginBottom: 0,
    padding: 0,
    borderRadius: 50,
    alignItems: "center",
    float: "right",
    position: "absolute",
    top: 40,
    right: 30,
  },
  card: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  label: { fontWeight: "600", marginTop: 10, marginBottom: 4 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    margin: 2,
  },
  timeBtn: {
    marginTop: 8,
    padding: 10,
    borderWidth: 1,
    borderRadius: 12,
  },
  saveBtn: {
    marginTop: 14,
    padding: 10,
    borderRadius: 14,
    alignItems: "center",
  },
  sectionHeader: { fontWeight: "700", marginBottom: 6 },
  reminderRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 16,
    marginVertical: 6,
    borderWidth: 1,
  },
  reminderTitle: { fontWeight: "700" },
  reminderMeta: { fontSize: 12 },
  smallBtn: {
    padding: 6,
    borderRadius: 8,
    marginVertical: 2,
    alignItems: "center",
  },
  rightButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: "auto",
  },
});
