import { Alert } from "react-native";
import { CommonActions } from "@react-navigation/native";

export function showLogoutConfirm({ title, message, onConfirm }) {
  Alert.alert(title, message, [
    { text: "Cancel", style: "cancel" },
    { text: "Logout", style: "destructive", onPress: onConfirm },
  ]);
}

export function resetNavigationToLogin(navigation) {
  let targetNavigation = navigation;

  while (targetNavigation?.getParent?.()) {
    targetNavigation = targetNavigation.getParent();
  }

  if (targetNavigation?.dispatch) {
    targetNavigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Login" }],
      })
    );
    return;
  }

  navigation?.reset?.({
    index: 0,
    routes: [{ name: "Login" }],
  });

  navigation?.navigate?.("Login");
}
