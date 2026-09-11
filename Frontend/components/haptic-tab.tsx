import { Platform, Pressable } from "react-native";
import * as Haptics from "expo-haptics";

export function HapticTab(props: any) {
  return (
    <Pressable
      {...props}
      onPressIn={(event) => {
        if (Platform.OS === "ios") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        props.onPressIn?.(event);
      }}
    />
  );
}

