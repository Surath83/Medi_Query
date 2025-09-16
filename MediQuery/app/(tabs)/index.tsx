import { Image } from 'expo-image';
import { Platform, Pressable, StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import Med from '../../components/med';

export default function HomeScreen() {

  const name = "abc";
  const age = 25;
  const height = 165.2; // cm
  const weight = 68.5;  // kg
  const gender = "male";

  const [visible, setVisible] = React.useState(true);

  // BMI calculation
  const bmi = (weight / ((height / 100) ** 2)).toFixed(2);

  // BMR calculation
  const calculateBMR = () => {
    if (gender === "male") {
      return (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      return (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
  };


  return (
    // <ParallaxScrollView
    //   headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
    //   headerImage={
    //     <Image
    //       source={require('@/assets/images/partial-react-logo.png')}
    //       style={styles.reactLogo}
    //     />
    //   }>
    //   <ThemedView style={styles.titleContainer}>
    //     <ThemedText type="title">Welcome!</ThemedText>
    //     <HelloWave />
    //   </ThemedView>
    //   <ThemedView style={styles.stepContainer}>
    //     <ThemedText type="subtitle">Step 1: Try it</ThemedText>
    //     <ThemedText>
    //       Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
    //       Press{' '}
    //       <ThemedText type="defaultSemiBold">
    //         {Platform.select({
    //           ios: 'cmd + d',
    //           android: 'cmd + m',
    //           web: 'F12',
    //         })}
    //       </ThemedText>{' '}
    //       to open developer tools.
    //     </ThemedText>
    //   </ThemedView>
    //   <ThemedView style={styles.stepContainer}>
    //     <Link href="/modal">
    //       <Link.Trigger>
    //         <ThemedText type="subtitle">Step 2: Explore</ThemedText>
    //       </Link.Trigger>
    //       <Link.Preview />
    //       <Link.Menu>
    //         <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
    //         <Link.MenuAction
    //           title="Share"
    //           icon="square.and.arrow.up"
    //           onPress={() => alert('Share pressed')}
    //         />
    //         <Link.Menu title="More" icon="ellipsis">
    //           <Link.MenuAction
    //             title="Delete"
    //             icon="trash"
    //             destructive
    //             onPress={() => alert('Delete pressed')}
    //           />
    //         </Link.Menu>
    //       </Link.Menu>
    //     </Link>

    //     <ThemedText>
    //       {`Tap the Explore tab to learn more about what's included in this starter app.`}
    //     </ThemedText>
    //   </ThemedView>
    //   <ThemedView style={styles.stepContainer}>
    //     <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
    //     <ThemedText>
    //       {`When you're ready, run `}
    //       <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
    //       <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
    //       <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
    //       <ThemedText type="defaultSemiBold">app-example</ThemedText>.
    //     </ThemedText>
    //   </ThemedView>
    // </ParallaxScrollView>
     <SafeAreaView style={styles.container}>
      <ThemedText style={styles.title}>Home Screen</ThemedText>
      <ThemedText style={styles.name}>{name}</ThemedText>
    <Pressable
        style={styles.eyeButton}
        onPress={() => setVisible(!visible)}
      >
        <Ionicons
          name={visible ? "eye" : "eye-off"}
          size={28}
          color="#1E293B"
        />
      </Pressable>
       {visible ? (
        <>
          <ThemedText style={styles.text}>Age: {age}     Ht: {height} cm    Wt: {weight} kg</ThemedText>
          
        </>
      ) : (
        <>
          <ThemedText style={styles.text}>Age: ...      Ht: ....      cm     Wt: ....      kg</ThemedText>
        </>
      )}
      <ThemedText style={styles.text}>BMI: {bmi}</ThemedText>
      <ThemedText style={styles.text}>BMR: {calculateBMR().toFixed(2)} cal/day</ThemedText>
      <Med />



    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#deebf8ff",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    color: "#1E293B",
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    color: "#334155",
  },
  text: {
    fontSize: 16,
    marginVertical: 4,
    color: "#475569",
  },
  eyeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    padding: 8,
  },
});
