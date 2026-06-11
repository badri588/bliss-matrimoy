import React from "react";
import { View, StyleSheet } from "react-native";

export default function AssistantAvatar({ size = 48 }) {
  const bubbleWidth = Math.round(size * 0.56);
  const bubbleHeight = Math.round(size * 0.42);
  const dotSize = Math.max(3, Math.round(size * 0.08));

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <View
        style={[
          styles.bubble,
          {
            width: bubbleWidth,
            height: bubbleHeight,
            borderRadius: bubbleHeight / 2,
          },
        ]}
      >
        <View
          style={[
            styles.tail,
            {
              left: bubbleWidth * 0.08,
              bottom: -bubbleHeight * 0.12,
              borderTopWidth: bubbleHeight * 0.26,
              borderRightWidth: bubbleWidth * 0.22,
            },
          ]}
        />

        <View style={styles.dotRow}>
          {[0, 1, 2].map((item) => (
            <View
              key={item}
              style={[
                styles.dot,
                {
                  width: dotSize,
                  height: dotSize,
                  borderRadius: dotSize / 2,
                },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  bubble: {
    backgroundColor: "#2C465B",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  tail: {
    position: "absolute",
    width: 0,
    height: 0,
    borderTopColor: "#2C465B",
    borderRightColor: "transparent",
  },
  dotRow: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    backgroundColor: "#F7FBFF",
    opacity: 0.92,
  },
});
