// import React from "react";
// import {
//   SafeAreaView,
//   ScrollView,
//   Image,
//   Text,
//   View,
//   StyleSheet,
//   Alert,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { COLORS } from "../constants/colors";
// import Header from "../components/Header";
// import PrimaryButton from "../components/PrimaryButton";
// import { useMatrimony } from "../context/MatrimonyContext";

// export default function ServiceDetailsScreen({ navigation, route }) {
//   const service = route.params?.service;
//   const { sendServiceRequest } = useMatrimony();

//   if (!service) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <Header
//           title="Service Details"
//           subtitle="No service selected"
//           navigation={navigation}
//           showBack={true}
//           showNotification={false}
//           backTo="MainTabs"
//         />
//         <View style={styles.emptyBox}>
//           <Text style={styles.emptyTitle}>No Service Found</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   const handleRequest = () => {
//     sendServiceRequest(service);
//     Alert.alert("Request Sent", "Vendor will contact you soon.");
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <Header
//         title="Service Details"
//         subtitle={service.category}
//         navigation={navigation}
//         showBack={true}
//         showNotification={true}
//         backTo="MainTabs"
//       />

//       <ScrollView contentContainerStyle={styles.content}>
//         <Image source={{ uri: service.image }} style={styles.image} />

//         <View style={styles.card}>
//           <Text style={styles.title}>{service.title}</Text>

//           <View style={styles.row}>
//             <Ionicons name="location-outline" size={18} color={COLORS.muted} />
//             <Text style={styles.meta}>{service.location}</Text>
//           </View>

//           <View style={styles.row}>
//             <Ionicons name="star" size={18} color={COLORS.gold} />
//             <Text style={styles.meta}>{service.rating} Rating</Text>
//           </View>

//           <Text style={styles.price}>{service.price}</Text>

//           <Text style={styles.sectionTitle}>Description</Text>
//           <Text style={styles.description}>{service.description}</Text>

//           <PrimaryButton
//             title="Send Booking Request"
//             onPress={handleRequest}
//             style={{ marginTop: 24 }}
//           />
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: COLORS.bg },
//   content: { padding: 16, paddingBottom: 40 },
//   image: { width: "100%", height: 260, borderRadius: 26 },
//   card: {
//     marginTop: 16,
//     backgroundColor: COLORS.white,
//     borderRadius: 26,
//     padding: 18,
//     elevation: 3,
//   },
//   title: { fontSize: 25, fontWeight: "900", color: COLORS.text },
//   row: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 },
//   meta: { color: COLORS.muted, fontWeight: "700" },
//   price: {
//     color: COLORS.primary,
//     fontSize: 18,
//     fontWeight: "900",
//     marginTop: 14,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "900",
//     color: COLORS.text,
//     marginTop: 20,
//   },
//   description: {
//     color: COLORS.muted,
//     lineHeight: 23,
//     marginTop: 8,
//     fontWeight: "600",
//   },
//   emptyBox: {
//     margin: 20,
//     backgroundColor: COLORS.white,
//     borderRadius: 20,
//     padding: 20,
//   },
//   emptyTitle: {
//     color: COLORS.text,
//     fontWeight: "900",
//     fontSize: 18,
//   },
// });


import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Image,
  Text,
  View,
  StyleSheet,
  Alert,
  Modal,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Asset } from "expo-asset";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { COLORS } from "../constants/colors";
import Header from "../components/Header";
import PrimaryButton from "../components/PrimaryButton";
import ImageZoomModal from "../components/ImageZoomModal";
import { useMatrimony } from "../context/MatrimonyContext";
import { translateServiceTitle } from "../constants/localization";
import { API_BASE_URL } from "../config/api";

const DEFAULT_SERVICE_IMAGE = Asset.fromModule(
  require("../../assets/Images/all-hero.png")
).uri;

const getBookingLabel = (service, language = "en") => {
  const category = String(service?.category || "").toLowerCase();
  const isTe = language === "te";
 
  if (category.includes("function hall")) return isTe ? "ఫంక్షన్ హాల్ బుక్ చేయండి" : "Book Function Hall";
  if (category.includes("car")) return isTe ? "కార్ బుక్ చేయండి" : "Book Bride/Groom Car";
  if (category.includes("cooking")) return isTe ? "కుకింగ్ టీం బుక్ చేయండి" : "Book Cooking Team";
  if (category.includes("photography")) return isTe ? "ఫోటోగ్రఫీ బుక్ చేయండి" : "Book Photography";
  if (category.includes("makeup")) return isTe ? "మేకప్ ఆర్టిస్ట్ బుక్ చేయండి" : "Book Makeup Artist";
  if (category.includes("decoration")) return isTe ? "డెకరేషన్ బుక్ చేయండి" : "Book Decoration";
  if (category.includes("arkestra")) return isTe ? "ఆర్కెస్ట్రా బుక్ చేయండి" : "Book Arkestra";
  if (category.includes("cleaning")) return isTe ? "క్లీనింగ్ టీం బుక్ చేయండి" : "Book Cleaning Team";

  return isTe ? "సర్వీస్ బుక్ చేయండి" : "Book Service";
};

const getLocalizedCategory = (category, language = "en") => {
  const value = String(category || "");

  if (language !== "te") {
    return value;
  }

  const map = {
    "Function Hall": "ఫంక్షన్ హాల్",
    Photography: "ఫోటోగ్రఫీ",
    Catering: "కేటరింగ్",
    Makeup: "మేకప్",
    Decoration: "డెకరేషన్",
    Arkestra: "ఆర్కెస్ట్రా",
    "Bride And Groom Car Services": "వధువు / వరుడు కార్ సర్వీసెస్",
    Cleaning: "క్లీనింగ్",
  };

  return map[value] || value;
};
 
const timeSlots = [
  "06:00 AM",
  "07:00 AM",
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
  "09:00 PM",
];

const SERVICE_DETAILS_TEXT = {
  en: {
    headerTitle: "Service Details",
    headerSubtitle: "Book the service and select schedule",
    noServiceSelected: "No service selected",
    noServiceFound: "No Service Found",
    rating: "Rating",
    description: "Description",
    bookingDatesTime: "Booking Dates & Time",
    selectDateTime: "Select from date, to date and time",
    dateHint: "Dates are available from two days after today.",
    selectTime: "Select Time",
    cancel: "Cancel",
    done: "Done",
    pleaseWait: "Please wait...",
    bookingPending: "Booking Pending",
    bookingApproved: "Booking Approved",
    bookingRejected: "Booking Rejected",
    sendBookingRequest: "Pay & Book Service",
    bookAgain: "Book Again",
    bookFunctionHall: "Book Function Hall",
    bookBrideGroomCar: "Book Bride/Groom Car",
    bookCookingTeam: "Book Cooking Team",
    bookPhotography: "Book Photography",
    bookMakeupArtist: "Book Makeup Artist",
    bookDecoration: "Book Decoration",
    bookArkestra: "Book Arkestra",
    bookCleaningTeam: "Book Cleaning Team",
    bookingConfirmed: "Booking Confirmed",
    bookingRequestSent: "Your booking request is sent to vendor approval.",
    bookingApprovedNote: "Admin approved your service booking.",
    bookingRejectedNote: "Admin rejected your service booking.",
    registrationCompletedConfirmed: "Registration completed and booking confirmed.",
    registrationCompletedSent:
      "Registration completed and booking request sent to vendor approval.",
    requestedMsgApproved: "Your {service} booking is approved.",
    requestedMsgRejected: "Your {service} booking is rejected.",
    requestedMsgPending: "Your {service} booking request is sent to vendor.",
    requestSent: "Request Sent",
    bookingDatePrefix: "Date:",
    bookingError: "Something went wrong.",
    sendError: "Unable to send request. Please try again.",
    registerError: "Unable to register. Please try again.",
  },
  te: {
    headerTitle: "సర్వీస్ వివరాలు",
    headerSubtitle: "సర్వీస్ బుక్ చేసి షెడ్యూల్ ఎంచుకోండి",
    noServiceSelected: "సర్వీస్ ఎంచుకోలేదు",
    noServiceFound: "సర్వీస్ కనబడలేదు",
    rating: "రేటింగ్",
    description: "వివరణ",
    bookingDatesTime: "బుకింగ్ తేదీలు & సమయం",
    selectDateTime: "from date, to date and time ఎంచుకోండి",
    dateHint: "ఈ రోజు తర్వాత రెండు రోజులకు నుంచి తేదీలు అందుబాటులో ఉంటాయి.",
    selectTime: "సమయం ఎంచుకోండి",
    cancel: "రద్దు",
    done: "సరే",
    pleaseWait: "దయచేసి వేచి ఉండండి...",
    bookingPending: "బుకింగ్ పెండింగ్",
    bookingApproved: "బుకింగ్ ఆమోదించబడింది",
    bookingRejected: "బుకింగ్ తిరస్కరించబడింది",
    sendBookingRequest: "పే చేసి సర్వీస్ బుక్ చేయండి",
    bookAgain: "మళ్లీ బుక్ చేయండి",
    bookFunctionHall: "ఫంక్షన్ హాల్ బుక్ చేయండి",
    bookBrideGroomCar: "వధువు/వరుడు కార్ బుక్ చేయండి",
    bookCookingTeam: "కుకింగ్ టీం బుక్ చేయండి",
    bookPhotography: "ఫోటోగ్రఫీ బుక్ చేయండి",
    bookMakeupArtist: "మేకప్ ఆర్టిస్ట్ బుక్ చేయండి",
    bookDecoration: "డెకరేషన్ బుక్ చేయండి",
    bookArkestra: "ఆర్కెస్ట్రా బుక్ చేయండి",
    bookCleaningTeam: "క్లీనింగ్ టీం బుక్ చేయండి",
    bookingConfirmed: "బుకింగ్ కన్ఫర్మ్ అయింది",
    bookingRequestSent: "మీ బుకింగ్ రిక్వెస్ట్ అడ్మిన్ ఆమోదం కోసం పంపబడింది.",
    bookingApprovedNote: "అడ్మిన్ మీ సర్వీస్ బుకింగ్‌ను ఆమోదించారు.",
    bookingRejectedNote: "అడ్మిన్ మీ సర్వీస్ బుకింగ్‌ను తిరస్కరించారు.",
    registrationCompletedConfirmed: "రిజిస్ట్రేషన్ పూర్తయి బుకింగ్ కన్ఫర్మ్ అయింది.",
    registrationCompletedSent:
      "రిజిస్ట్రేషన్ పూర్తయి బుకింగ్ రిక్వెస్ట్ అడ్మిన్ ఆమోదం కోసం పంపబడింది.",
    requestedMsgApproved: "మీ {service} బుకింగ్ ఆమోదించబడింది.",
    requestedMsgRejected: "మీ {service} బుకింగ్ తిరస్కరించబడింది.",
    requestedMsgPending: "మీ {service} బుకింగ్ రిక్వెస్ట్ అడ్మిన్‌కు పంపబడింది.",
    requestSent: "రిక్వెస్ట్ పంపబడింది",
    bookingDatePrefix: "తేదీ:",
    bookingError: "ఏదో తప్పు జరిగింది.",
    sendError: "రిక్వెస్ట్ పంపలేకపోయాం. మళ్లీ ప్రయత్నించండి.",
    registerError: "రిజిస్టర్ చేయలేకపోయాం. మళ్లీ ప్రయత్నించండి.",
  },
};
 
const formatDateValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
 
const formatMonthTitle = (date) =>
  date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
 
const buildCalendarDays = (monthDate) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: firstDay }, () => null);
 
  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(new Date(year, month, day));
  }
 
  return days;
};

const getDateRangeValues = (fromDate, toDate = fromDate) => {
  if (!fromDate) return [];

  const values = [];
  const start = new Date(`${fromDate}T00:00:00`);
  const end = new Date(`${toDate || fromDate}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return values;
  }

  const cursor = start <= end ? start : end;
  const finalDate = start <= end ? end : start;

  while (cursor <= finalDate) {
    values.push(formatDateValue(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return values;
};
 
export default function ServiceDetailsScreen({ navigation, route }) {
  const service = route.params?.service;
 
  const {
    myProfile,
    hasApprovedServiceBooking,
    getLatestServiceBookingDecision,
    getLatestServiceRequest,
    loadServiceRequests,
    language,
    appTheme,
    downloadInvoice,
  } = useMatrimony();
  const t = SERVICE_DETAILS_TEXT[language] || SERVICE_DETAILS_TEXT.en;
  const theme = appTheme || {
    bg: COLORS.bg,
    card: COLORS.white,
    text: COLORS.text,
    muted: COLORS.muted,
    border: COLORS.border,
    soft: COLORS.softOrange,
    mode: "light",
  };
 
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [bookingDate, setBookingDate] = useState("");
  const [bookingEndDate, setBookingEndDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookedDateSet, setBookedDateSet] = useState(() => new Set());
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerUri, setViewerUri] = useState("");
  const [viewerTitle, setViewerTitle] = useState("");
 
  const calendarDays = useMemo(
    () => buildCalendarDays(calendarMonth),
    [calendarMonth]
  );
 
  const bookingDetails = {
    bookingDate,
    bookingEndDate,
    bookingTime,
  };
  const latestRequest = getLatestServiceRequest?.(service?.id);
  const latestDecision = getLatestServiceBookingDecision?.(service?.id);
  const openViewer = (uri, title = "Image Preview") => {
    if (!uri) {
      return;
    }

    setViewerUri(uri);
    setViewerTitle(title);
    setViewerVisible(true);
  };

  const closeViewer = () => {
    setViewerVisible(false);
    setViewerUri("");
    setViewerTitle("");
  };
  const handleDownloadInvoice = async () => {
    if (!latestRequest) {
      return;
    }

    await Promise.resolve(downloadInvoice?.(latestRequest, {
      invoiceTitle: "Service Booking Invoice",
      appName: "All Matrimony",
      serviceTitle: service?.title || latestRequest?.serviceTitle || "Wedding Service",
      customerName: latestRequest?.userName || latestRequest?.customerName || myProfile?.name || "",
      customerPhone: latestRequest?.phone || myProfile?.phone || "",
      customerEmail: latestRequest?.email || myProfile?.email || "",
      customerLocation: latestRequest?.customerLocation || latestRequest?.location || myProfile?.location || "",
    })).catch(() => null);
  };

  const loadBookedDates = React.useCallback(async () => {
    if (!service?.id) {
      setBookedDateSet(new Set());
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/service-requests`);
      const data = await response.json();
      const requests = Array.isArray(data?.data) ? data.data : [];
      const serviceBookedDates = requests
        .filter((request) => {
          const status = String(request?.status || "").toUpperCase();
          const sameService = String(request?.serviceId || "") === String(service.id);
          const sameVendor =
            service?.vendorId != null &&
            request?.vendorId != null &&
            String(request.vendorId) === String(service.vendorId) &&
            String(request?.category || "").toLowerCase() === String(service?.category || "").toLowerCase();

          return (sameService || sameVendor) && status !== "REJECTED";
        })
        .flatMap((request) =>
          getDateRangeValues(
            request?.bookingDate || request?.fromDate,
            request?.bookingEndDate || request?.toDate || request?.bookingDate || request?.fromDate
          )
        );

      setBookedDateSet(new Set(serviceBookedDates));
    } catch (error) {
      setBookedDateSet(new Set());
    }
  }, [service?.id, service?.vendorId, service?.category]);

  useFocusEffect(
    React.useCallback(() => {
      loadServiceRequests?.();
      loadBookedDates();
    }, [loadServiceRequests, loadBookedDates])
  );

  useEffect(() => {
    loadBookedDates();
  }, [loadBookedDates]);
 
  if (!service) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <Header
          title={t.headerTitle}
          subtitle={t.noServiceSelected}
          navigation={navigation}
          showBack={true}
          showNotification={false}
          backTo="MainTabs"
        />
 
        <View
          style={[
            styles.emptyBox,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            {t.noServiceFound}
          </Text>
        </View>
      </SafeAreaView>
    );
  }
 
  const getImageSource = () => {
    if (!service?.image) {
      return {
        uri: DEFAULT_SERVICE_IMAGE,
      };
    }
 
    if (typeof service.image === "string") {
      return { uri: service.image };
    }
 
    return service.image;
  };
 
  const handleRequest = async () => {
    if (!bookingDate || !bookingEndDate || !bookingTime) {
      setShowCalendar(true);
      return;
    }

    navigation.navigate("ServiceBookingPayment", {
      service,
      bookingDetails,
      customerDetails: {
        name: myProfile?.name || "",
        phone: myProfile?.phone || "",
        email: myProfile?.email || "",
        location: myProfile?.location || "",
      },
    });
  };
 
  const changeMonth = (offset) => {
    setCalendarMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1)
    );
  };
 
  const handleDateSelect = (date) => {
    const nextDate = formatDateValue(date);

    if (bookedDateSet.has(nextDate)) {
      Alert.alert("Date Booked", "This date is already booked. Please choose a green available date.");
      return;
    }
 
    if (!bookingDate || (bookingDate && bookingEndDate)) {
      setBookingDate(nextDate);
      setBookingEndDate("");
      setBookingTime("");
      return;
    }
 
    if (nextDate < bookingDate) {
      setBookingDate(nextDate);
      setBookingEndDate("");
      setBookingTime("");
      return;
    }

    const selectedRange = getDateRangeValues(bookingDate, nextDate);
    const hasBookedDateInRange = selectedRange.some((value) => bookedDateSet.has(value));

    if (hasBookedDateInRange) {
      Alert.alert(
        "Date Not Available",
        "Your selected range includes a booked red date. Please select an available green range."
      );
      return;
    }
 
    setBookingEndDate(nextDate);
  };
 
  const getMinimumBookingDate = () => {
    const minimumDate = new Date();
    minimumDate.setDate(minimumDate.getDate() + 2);
    minimumDate.setHours(0, 0, 0, 0);
    return minimumDate;
  };
 
  const isBeforeMinimumDate = (date) => {
    const value = new Date(date);
    value.setHours(0, 0, 0, 0);
    return value < getMinimumBookingDate();
  };
 
  const isDateInRange = (dateValue) => {
    if (!bookingDate || !bookingEndDate) return false;
    return dateValue > bookingDate && dateValue < bookingEndDate;
  };

  const isBookedDate = (dateValue) => bookedDateSet.has(dateValue);
 
  const closeCalendar = () => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      document.activeElement?.blur?.();
    }
 
    setShowCalendar(false);
  };
 
  const renderCalendar = () => (
    <Modal
      visible={showCalendar}
      transparent
      animationType="slide"
      onRequestClose={closeCalendar}
    >
      <View style={styles.calendarOverlay}>
        <View style={styles.calendarBox}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity
              style={styles.calendarIconBtn}
              onPress={() => changeMonth(-1)}
            >
              <Ionicons name="chevron-back" size={22} color={theme.text} />
            </TouchableOpacity>

            <Text style={styles.calendarTitle}>
              {formatMonthTitle(calendarMonth)}
            </Text>
 
            <TouchableOpacity
              style={styles.calendarIconBtn}
              onPress={() => changeMonth(1)}
            >
              <Ionicons name="chevron-forward" size={22} color={theme.text} />
            </TouchableOpacity>
          </View>
 
          <View style={styles.weekRow}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <Text key={day} style={styles.weekText}>
                {day}
              </Text>
            ))}
          </View>
 
          <View style={styles.daysGrid}>
            {calendarDays.map((date, index) => {
              const dateValue = date ? formatDateValue(date) : "";
              const selected =
                dateValue === bookingDate || dateValue === bookingEndDate;
              const inRange = isDateInRange(dateValue);
              const booked = date ? isBookedDate(dateValue) : false;
              const disabled = date ? isBeforeMinimumDate(date) || booked : true;
              const available = date && !disabled && !selected && !inRange;
 
              return (
                <TouchableOpacity
                  key={`${dateValue || "empty"}-${index}`}
                  style={[
                    styles.dayCell,
                    available && styles.availableDayCell,
                    booked && styles.bookedDayCell,
                    inRange && styles.rangeDayCell,
                    selected && styles.selectedDayCell,
                    disabled && !booked && styles.disabledDayCell,
                  ]}
                  disabled={disabled}
                  onPress={() => handleDateSelect(date)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      selected && styles.selectedDayText,
                      booked && styles.bookedDayText,
                      disabled && !booked && styles.disabledDayText,
                    ]}
                  >
                    {date ? date.getDate() : ""}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
 
          <Text style={styles.rangeHint}>
            {t.dateHint}
          </Text>

          <View style={styles.calendarLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendAvailable]} />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendBooked]} />
              <Text style={styles.legendText}>Booked</Text>
            </View>
          </View>

          {!!bookingDate && (
            <View style={styles.selectedScheduleBox}>
              <Text style={styles.selectedScheduleText}>
                From: {bookingDate}
                {bookingEndDate ? `  To: ${bookingEndDate}` : "  Select end date"}
              </Text>
            </View>
          )}

          <Text style={styles.timeTitle}>{t.selectTime}</Text>
          <View style={styles.timeGrid}>
            {timeSlots.map((slot) => (
              <TouchableOpacity
                key={slot}
                style={[
                  styles.timeChip,
                  bookingTime === slot && styles.selectedTimeChip,
                ]}
                onPress={() => setBookingTime(slot)}
              >
                <Text
                  style={[
                    styles.timeChipText,
                    bookingTime === slot && styles.selectedTimeChipText,
                  ]}
                >
                  {slot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
 
          <View style={styles.calendarActions}>
            <TouchableOpacity
              style={[styles.calendarActionBtn, styles.cancelBtn]}
              onPress={closeCalendar}
            >
              <Text style={styles.cancelText}>{t.cancel}</Text>
            </TouchableOpacity>
 
            <TouchableOpacity
              style={[
                styles.calendarActionBtn,
                styles.doneBtn,
                (!bookingDate || !bookingEndDate || !bookingTime) &&
                  styles.disabledDoneBtn,
              ]}
              disabled={!bookingDate || !bookingEndDate || !bookingTime}
              onPress={closeCalendar}
            >
              <Text style={styles.doneText}>{t.done}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
 
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <Header
        title={t.headerTitle}
        subtitle={getLocalizedCategory(service.category, language)}
        navigation={navigation}
        showBack={true}
        showNotification={true}
        backTo="MainTabs"
      />

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity activeOpacity={0.9} onPress={() => openViewer(getImageSource()?.uri || getImageSource(), service?.title || "Service Image")}>
          <Image source={getImageSource()} style={styles.image} />
        </TouchableOpacity>

        <View
          style={[
            styles.card,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.title, { color: theme.text }]}>
            {translateServiceTitle(language, service.title)}
          </Text>

          <View style={styles.row}>
            <Ionicons name="location-outline" size={18} color={theme.muted} />
            <Text style={[styles.meta, { color: theme.muted }]}>{service.location}</Text>
          </View>

          <View style={styles.row}>
            <Ionicons name="star" size={18} color={COLORS.gold} />
            <Text style={[styles.meta, { color: theme.muted }]}>
              {service.rating} {t.rating}
            </Text>
          </View>

          <Text style={styles.price}>{service.price}</Text>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {t.description}
          </Text>
          <Text style={[styles.description, { color: theme.muted }]}>
            {service.description}
          </Text>

          {Array.isArray(service.galleryPhotos) && service.galleryPhotos.length > 1 && (
            <>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Service Photos</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryRow}>
                {service.galleryPhotos.filter((photo) => !photo?.isCover).map((photo, index) => (
                  <TouchableOpacity
                    key={photo.id || index}
                    activeOpacity={0.9}
                    onPress={() => openViewer(photo.uri, photo.label || service?.title || "Service Photo")}
                  >
                    <Image
                      source={{ uri: photo.uri }}
                      style={styles.galleryImage}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          {service.serviceDetails && Object.keys(service.serviceDetails).length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Service Details</Text>
              <View style={styles.detailList}>
                {Object.entries(service.serviceDetails)
                  .filter(([, value]) => String(value || "").trim())
                  .map(([key, value]) => (
                    <View key={key} style={styles.detailRow}>
                      <Text style={[styles.detailKey, { color: theme.muted }]}>{key}</Text>
                      <Text style={[styles.detailValue, { color: theme.text }]}>{String(value)}</Text>
                    </View>
                  ))}
              </View>
            </>
          )}

          {Array.isArray(service.packages) && service.packages.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Packages</Text>
              {service.packages.map((pkg, index) => (
                <View key={pkg.id || index} style={[styles.packageBox, { borderColor: theme.border, backgroundColor: theme.bg }]}>
                  <View style={styles.packageTop}>
                    <Text style={[styles.packageName, { color: theme.text }]}>{pkg.name || "Package"}</Text>
                    <Text style={styles.packagePrice}>₹{pkg.price || "Contact"}</Text>
                  </View>
                  {!!pkg.includes && <Text style={[styles.packageText, { color: theme.muted }]}>{pkg.includes}</Text>}
                  {!!pkg.description && <Text style={[styles.packageText, { color: theme.muted }]}>{pkg.description}</Text>}
                </View>
              ))}
            </>
          )}

          {!!latestRequest && (
            <View
              style={[
                styles.statusBox,
                latestRequest.status === "APPROVED"
                  ? styles.approvedStatusBox
                  : latestRequest.status === "REJECTED"
                  ? styles.rejectedStatusBox
                  : styles.pendingStatusBox,
              ]}
            >
              <Text style={[styles.statusTitle, { color: theme.text }]}>
                {latestRequest.status === "APPROVED"
                  ? t.bookingApproved
                  : latestRequest.status === "REJECTED"
                  ? t.bookingRejected
                  : t.bookingPending}
              </Text>
              <Text style={[styles.statusText, { color: theme.muted }]}>
                {latestRequest.adminMessage ||
                  (latestRequest.status === "APPROVED"
                    ? t.bookingApprovedNote
                    : latestRequest.status === "REJECTED"
                    ? t.bookingRejectedNote
                    : t.bookingRequestSent)}
              </Text>
            </View>
          )}

          {!!latestRequest && String(latestRequest.paymentStatus || latestRequest.invoiceStatus || "").toUpperCase() === "PAID" && (
            <View style={styles.invoiceBox}>
              <Text style={styles.invoiceTitle}>Invoice</Text>
              <Text style={styles.invoiceLine}>
                No: {latestRequest.invoiceNumber || latestRequest.invoice?.number || "N/A"}
              </Text>
              <Text style={styles.invoiceLine}>
                Amount: ₹{latestRequest.invoiceAmount || latestRequest.invoice?.amount || latestRequest.paymentAmount || 0}
              </Text>
              <Text style={styles.invoiceLine}>
                Ref: {latestRequest.invoiceReference || latestRequest.invoice?.reference || "N/A"}
              </Text>
              <TouchableOpacity style={styles.invoiceDownloadBtn} onPress={handleDownloadInvoice}>
                <Ionicons name="download-outline" size={16} color={COLORS.primary} />
                <Text style={styles.invoiceDownloadText}>Download PDF</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {t.bookingDatesTime}
          </Text>
          <TouchableOpacity
            style={[
              styles.datePicker,
              { backgroundColor: theme.bg, borderColor: theme.border },
            ]}
            activeOpacity={0.85}
            onPress={() => setShowCalendar(true)}
          >
            <Ionicons name="calendar-outline" size={22} color={COLORS.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.datePickerLabel, { color: theme.text }]}>
                {bookingDate && bookingEndDate && bookingTime
                  ? `${bookingDate} to ${bookingEndDate}, ${bookingTime}`
                  : t.selectDateTime}
              </Text>
              <Text style={[styles.datePickerHint, { color: theme.muted }]}>
                {t.dateHint}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.muted} />
          </TouchableOpacity>

          <PrimaryButton
            title={
              latestRequest?.status === "PENDING"
                ? t.bookingPending
                : hasApprovedServiceBooking?.(service?.id)
                ? getBookingLabel(service, language)
                : latestRequest?.status === "REJECTED"
                ? t.bookAgain
                : getBookingLabel(service, language)
            }
            onPress={handleRequest}
            style={{ marginTop: 24 }}
            disabled={latestRequest?.status === "PENDING"}
          />
        </View>
      </ScrollView>

      <ImageZoomModal
        visible={viewerVisible}
        sourceUri={viewerUri}
        title={viewerTitle}
        onClose={closeViewer}
      />
 
      {renderCalendar()}
    </SafeAreaView>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 40 },
  image: { width: "100%", height: 260, borderRadius: 26 },
  card: {
    marginTop: 16,
    backgroundColor: COLORS.white,
    borderRadius: 26,
    padding: 18,
    elevation: 3,
  },
  title: { fontSize: 25, fontWeight: "900", color: COLORS.text },
  row: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 },
  meta: { color: COLORS.muted, fontWeight: "700" },
  price: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text,
    marginTop: 20,
  },
  description: {
    color: COLORS.muted,
    lineHeight: 23,
    marginTop: 8,
    fontWeight: "600",
  },
  galleryRow: {
    gap: 10,
    marginTop: 10,
  },
  galleryImage: {
    width: 132,
    height: 96,
    borderRadius: 14,
  },
  detailList: {
    marginTop: 8,
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailKey: {
    flex: 1,
    fontWeight: "700",
  },
  detailValue: {
    flex: 1,
    textAlign: "right",
    fontWeight: "800",
  },
  packageBox: {
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  packageTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  packageName: {
    flex: 1,
    fontWeight: "900",
  },
  packagePrice: {
    color: COLORS.primary,
    fontWeight: "900",
  },
  packageText: {
    marginTop: 6,
    lineHeight: 19,
    fontWeight: "600",
  },
  statusBox: {
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  approvedStatusBox: {
    backgroundColor: COLORS.softGreen,
    borderColor: COLORS.success,
  },
  rejectedStatusBox: {
    backgroundColor: COLORS.softRose,
    borderColor: COLORS.danger,
  },
  pendingStatusBox: {
    backgroundColor: COLORS.softOrange,
    borderColor: COLORS.warning,
  },
  statusTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "900",
  },
  statusText: {
    color: COLORS.muted,
    marginTop: 4,
    lineHeight: 19,
    fontWeight: "700",
  },
  invoiceBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#F8F3FF",
    borderWidth: 1,
    borderColor: "#E6D8FF",
  },
  invoiceTitle: {
    color: COLORS.primary,
    fontWeight: "900",
    marginBottom: 6,
  },
  invoiceLine: {
    color: COLORS.text,
    fontWeight: "700",
    marginTop: 3,
  },
  invoiceDownloadBtn: {
    marginTop: 12,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E6D8FF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  invoiceDownloadText: {
    color: COLORS.primary,
    fontWeight: "900",
  },
  datePicker: {
    marginTop: 10,
    minHeight: 66,
    borderRadius: 18,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  datePickerLabel: {
    color: COLORS.text,
    fontWeight: "900",
  },
  datePickerHint: {
    color: COLORS.muted,
    marginTop: 3,
    fontWeight: "600",
    fontSize: 12,
  },
  calendarOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  calendarBox: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 16,
    maxHeight: "92%",
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  calendarIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekText: {
    width: `${100 / 7}%`,
    textAlign: "center",
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "900",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  availableDayCell: {
    backgroundColor: "#E8F5E9",
    borderWidth: 1,
    borderColor: "#A5D6A7",
  },
  bookedDayCell: {
    backgroundColor: "#FFEBEE",
    borderWidth: 1,
    borderColor: "#EF9A9A",
  },
  selectedDayCell: {
    backgroundColor: COLORS.primary,
  },
  rangeDayCell: {
    backgroundColor: COLORS.softOrange,
  },
  disabledDayCell: {
    opacity: 0.35,
  },
  dayText: {
    color: COLORS.text,
    fontWeight: "900",
  },
  selectedDayText: {
    color: COLORS.white,
  },
  bookedDayText: {
    color: "#C62828",
  },
  disabledDayText: {
    color: COLORS.muted,
  },
  calendarLegend: {
    flexDirection: "row",
    gap: 14,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendAvailable: {
    backgroundColor: "#4CAF50",
  },
  legendBooked: {
    backgroundColor: "#F44336",
  },
  legendText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  selectedScheduleBox: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
  },
  selectedScheduleText: {
    color: COLORS.text,
    fontWeight: "900",
    fontSize: 12,
  },
  timeTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 14,
    marginBottom: 10,
  },
  rangeHint: {
    color: COLORS.muted,
    marginTop: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  timeChip: {
    width: "23%",
    minHeight: 38,
    borderRadius: 12,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedTimeChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timeChipText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "900",
  },
  selectedTimeChipText: {
    color: COLORS.white,
  },
  calendarActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  calendarActionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtn: {
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  doneBtn: {
    backgroundColor: COLORS.primary,
  },
  disabledDoneBtn: {
    opacity: 0.55,
  },
  cancelText: {
    color: COLORS.text,
    fontWeight: "900",
  },
  doneText: {
    color: COLORS.white,
    fontWeight: "900",
  },
  emptyBox: {
    margin: 20,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
  },
  emptyTitle: {
    color: COLORS.text,
    fontWeight: "900",
    fontSize: 18,
  },
});
