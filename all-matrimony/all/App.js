import React from "react";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { MatrimonyProvider } from "./src/context/MatrimonyContext";
import RootNavigator from "./src/navigation/RootNavigator";
import { useMatrimony } from "./src/context/MatrimonyContext";

function AppShell() {
  const { appTheme } = useMatrimony();
  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: appTheme?.bg || DefaultTheme.colors.background,
      card: appTheme?.card || DefaultTheme.colors.card,
      text: appTheme?.text || DefaultTheme.colors.text,
      border: appTheme?.border || DefaultTheme.colors.border,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <MatrimonyProvider>
      <AppShell />
    </MatrimonyProvider>
  );
}
