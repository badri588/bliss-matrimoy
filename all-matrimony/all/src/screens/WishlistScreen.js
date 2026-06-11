import React from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
} from "react-native";
import { COLORS } from "../constants/colors";
import { getStrings } from "../constants/i18n";
import Header from "../components/Header";
import ProfileCard from "../components/ProfileCard";
import { useMatrimony } from "../context/MatrimonyContext";

export default function WishlistScreen({ navigation }) {
  const { wishlist, removeFromWishlist, appTheme, language } = useMatrimony();
  const t = getStrings(language).wishlist;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appTheme?.bg || COLORS.bg }]}>
      <Header
        title={t.headerTitle}
        subtitle={t.headerSubtitle}
        navigation={navigation}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {wishlist.length === 0 ? (
          <View
            style={[
              styles.empty,
              {
                backgroundColor: appTheme?.card || COLORS.white,
                borderColor: appTheme?.border || COLORS.border,
              },
            ]}
          >
            <Text style={[styles.emptyTitle, { color: appTheme?.text || COLORS.text }]}>
              {t.emptyTitle}
            </Text>
            <Text style={[styles.emptyText, { color: appTheme?.muted || COLORS.muted }]}>
              {t.emptyText}
            </Text>
          </View>
        ) : (
          wishlist.map((item) => (
            <View key={item.id}>
              <ProfileCard
                item={item}
                isWishlisted={true}
                onPress={() =>
                  navigation.navigate("ProfileDetails", { profile: item })
                }
                onWishlist={() => removeFromWishlist(item.id)}
              />

              <TouchableOpacity
                style={styles.removeBtn}
                onPress={async () => {
                  await removeFromWishlist(item.id);
                }}
              >
                <Text style={styles.removeText}>Remove from Wishlist</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  empty: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text,
  },
  emptyText: {
    color: COLORS.muted,
    textAlign: "center",
    marginTop: 8,
    fontWeight: "600",
  },
  removeBtn: {
    marginBottom: 18,
    marginTop: -6,
    alignSelf: "center",
  },
  removeText: {
    color: COLORS.danger,
    fontWeight: "900",
  },
});
