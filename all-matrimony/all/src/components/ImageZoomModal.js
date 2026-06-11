import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../constants/colors";

const MIN_SCALE = 1;
const MAX_SCALE = 4;

export default function ImageZoomModal({
  visible,
  sourceUri,
  title = "Image Preview",
  onClose,
}) {
  const [scale, setScale] = useState(MIN_SCALE);

  useEffect(() => {
    if (!visible) {
      setScale(MIN_SCALE);
    }
  }, [visible]);

  if (!sourceUri) {
    return null;
  }

  const zoomIn = () => setScale((current) => Math.min(MAX_SCALE, Number((current + 0.5).toFixed(2))));
  const zoomOut = () => setScale((current) => Math.max(MIN_SCALE, Number((current - 0.5).toFixed(2))));
  const resetZoom = () => setScale(MIN_SCALE);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <SafeAreaView style={styles.backdrop}>
        <View style={styles.topBar}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.85}>
            <Ionicons name="close" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.viewerCard}>
          <View style={styles.imageWrap}>
            <Image
              source={{ uri: sourceUri }}
              resizeMode="contain"
              style={[styles.image, { transform: [{ scale }] }]}
            />
          </View>

          <Text style={styles.hint}>Use the buttons below to zoom in and out.</Text>

          <View style={styles.controls}>
            <TouchableOpacity style={styles.controlBtn} onPress={zoomOut} activeOpacity={0.85}>
              <Ionicons name="remove" size={22} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlBtnPrimary} onPress={resetZoom} activeOpacity={0.85}>
              <Text style={styles.controlBtnPrimaryText}>{Math.round(scale * 100)}%</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlBtn} onPress={zoomIn} activeOpacity={0.85}>
              <Ionicons name="add" size={22} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.94)",
    padding: 16,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  title: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    marginRight: 12,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  viewerCard: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: "#111827",
    overflow: "hidden",
    padding: 14,
  },
  imageWrap: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: "#000",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  hint: {
    color: "#D1D5DB",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 12,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 14,
    marginBottom: 6,
  },
  controlBtn: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  controlBtnPrimary: {
    minWidth: 92,
    height: 52,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  controlBtnPrimaryText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
  },
});
