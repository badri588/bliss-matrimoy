import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "../screens/SplashScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import AdminLoginScreen from "../screens/AdminLoginScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";

import MainTabNavigator from "./MainTabNavigator";
import AdminTabNavigator from "./AdminTabNavigator";

import ProfileDetailsScreen from "../screens/ProfileDetailsScreen";
import ServiceDetailsScreen from "../screens/ServiceDetailsScreen";
import ChatScreen from "../screens/ChatScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import PremiumScreen from "../screens/PremiumScreen";
import AiChatScreen from "../screens/AiChatScreen";
import PaymentCheckoutScreen from "../screens/PaymentCheckoutScreen";
import ServiceBookingPaymentScreen from "../screens/ServiceBookingPaymentScreen";
import ServiceBookingSuccessScreen from "../screens/ServiceBookingSuccessScreen";
import VerificationSubmitScreen from "../screens/VerificationSubmitScreen";
import VendorApprovalWaitingScreen from "../screens/vendor/VendorApprovalWaitingScreen";
import VendorBookingDecisionScreen from "../screens/vendor/VendorBookingDecisionScreen";
import VendorBookingsScreen from "../screens/vendor/VendorBookingsScreen";
import VendorDashboardScreen from "../screens/vendor/VendorDashboardScreen";
import VendorKYCScreen from "../screens/vendor/VendorKYCScreen";
import VendorNotificationsScreen from "../screens/vendor/VendorNotificationsScreen";
import VendorPackagesScreen from "../screens/vendor/VendorPackagesScreen";
import VendorPhotosScreen from "../screens/vendor/VendorPhotosScreen";
import VendorProfileScreen from "../screens/vendor/VendorProfileScreen";
import VendorRegisterScreen from "../screens/vendor/VendorRegisterScreen";
import VendorRevenueScreen from "../screens/vendor/VendorRevenueScreen";
import VendorServicePage from "../screens/vendor/VendorServicePage";

import ProfileCreateEditScreen from "../screens/ProfileCreateEditScreen";
import SearchFilterScreen from "../screens/SearchFilterScreen";
import InterestRequestsScreen from "../screens/InterestRequestsScreen";
import { useMatrimony } from "../context/MatrimonyContext";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { appTheme } = useMatrimony();

  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: {
          backgroundColor: appTheme?.bg || "#FFF7F2",
        },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />

      <Stack.Screen name="Login" component={LoginScreen} />

      <Stack.Screen name="Register" component={RegisterScreen} />

      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
      />

      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />

      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="AdminTabs"
        component={AdminTabNavigator}
        options={{
          gestureEnabled: false,
        }}
      />

      <Stack.Screen name="ProfileDetails" component={ProfileDetailsScreen} />

      <Stack.Screen
        name="ProfileCreateEdit"
        component={ProfileCreateEditScreen}
      />

      <Stack.Screen name="SearchFilter" component={SearchFilterScreen} />

      <Stack.Screen
        name="InterestRequests"
        component={InterestRequestsScreen}
      />

      <Stack.Screen
        name="VerificationSubmit"
        component={VerificationSubmitScreen}
      />

      <Stack.Screen name="ServiceDetails" component={ServiceDetailsScreen} />

      <Stack.Screen name="Chat" component={ChatScreen} />

      <Stack.Screen name="Notifications" component={NotificationsScreen} />

      <Stack.Screen name="Premium" component={PremiumScreen} />

      <Stack.Screen name="AiChat" component={AiChatScreen} />

      <Stack.Screen name="PaymentCheckout" component={PaymentCheckoutScreen} />
      <Stack.Screen
        name="ServiceBookingPayment"
        component={ServiceBookingPaymentScreen}
      />
      <Stack.Screen
        name="ServiceBookingSuccess"
        component={ServiceBookingSuccessScreen}
      />

      <Stack.Screen name="VendorRegister" component={VendorRegisterScreen} />
      <Stack.Screen
        name="VendorApprovalWaiting"
        component={VendorApprovalWaitingScreen}
      />
      <Stack.Screen
        name="VendorDashboard"
        component={VendorDashboardScreen}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen name="VendorProfile" component={VendorProfileScreen} />
      <Stack.Screen name="VendorServicePage" component={VendorServicePage} />
      <Stack.Screen name="VendorKYC" component={VendorKYCScreen} />
      <Stack.Screen name="VendorPhotos" component={VendorPhotosScreen} />
      <Stack.Screen name="VendorPackages" component={VendorPackagesScreen} />
      <Stack.Screen name="VendorBookings" component={VendorBookingsScreen} />
      <Stack.Screen
        name="VendorBookingDecision"
        component={VendorBookingDecisionScreen}
      />
      <Stack.Screen name="VendorRevenue" component={VendorRevenueScreen} />
      <Stack.Screen
        name="VendorNotifications"
        component={VendorNotificationsScreen}
      />
    </Stack.Navigator>
  );
}
