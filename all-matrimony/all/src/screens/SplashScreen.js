import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { COLORS } from "../constants/colors";

export default function SplashScreen({ navigation }) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace("Login");
    }, 1800);

    return () => clearTimeout(timer);
  }, [navigation, scaleAnim, fadeAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary, COLORS.maroon || COLORS.primaryDark]}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.logoWrap,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.logoCircle}>
            <Ionicons name="heart" size={48} color={COLORS.primary} />
          </View>

          <Text style={styles.title}>Bliss Matrimony</Text>
          <Text style={styles.subtitle}>
            Trusted matches and wedding services
          </Text>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  gradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  logoWrap: {
    alignItems: "center",
  },

  logoCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    marginBottom: 22,
  },

  title: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
  },

  subtitle: {
    color: "#FDEDD8",
    marginTop: 8,
    fontWeight: "700",
    textAlign: "center",
    fontSize: 14,
  },
});
