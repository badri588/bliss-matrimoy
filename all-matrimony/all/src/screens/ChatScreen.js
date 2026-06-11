import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";
import Header from "../components/Header";
import InlineMessage from "../components/InlineMessage";
import { useMatrimony } from "../context/MatrimonyContext";
import { buildChatSocketUrl } from "../config/api";

const QUICK_EMOJIS = ["😊", "❤️", "👍", "😂", "🙏", "😍"];

const mergeUniqueMessages = (previousMessages, incomingMessages) => {
  const messageMap = new Map();

  [...previousMessages, ...incomingMessages].forEach((item, index) => {
    const key =
      item?.id != null
        ? `id-${item.id}`
        : `fallback-${item?.senderUserId}-${item?.receiverUserId}-${item?.sentAt}-${index}`;

    messageMap.set(key, item);
  });

  return Array.from(messageMap.values()).sort((a, b) => {
    const aTime = a?.sentAt ? new Date(a.sentAt).getTime() : 0;
    const bTime = b?.sentAt ? new Date(b.sentAt).getTime() : 0;
    return aTime - bTime;
  });
};

const formatMessageTime = (value) => {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatMessageDate = (value) => {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getMessageTick = (item) => {
  if (!item?.mine) {
    return null;
  }

  return item.read ? "done-all" : "checkmark";
};

export default function ChatScreen({ navigation, route }) {
  const profile = route.params?.profile;
  const { currentUser, getConversation, getPresence, sendChatMessage } =
    useMatrimony();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("info");
  const [presenceLabel, setPresenceLabel] = useState("offline");
  const socketRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadConversation = async () => {
      if (!currentUser?.id || !profile?.id) {
        return;
      }

      const result = await getConversation(profile.id);

      if (!isMounted) {
        return;
      }

      if (!result?.success) {
        setStatusType("error");
        setStatusMessage(result?.message || "Unable to load chat.");
        return;
      }

      setMessages(mergeUniqueMessages([], result.messages || []));
      setStatusMessage("");
    };

    loadConversation();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.id, getConversation, profile?.id]);

  useEffect(() => {
    let active = true;

    const loadPresence = async () => {
      if (!profile?.id) {
        return;
      }

      const result = await getPresence(profile.id);

      if (!active || !result?.success) {
        return;
      }

      setPresenceLabel(result.data?.online ? "online" : "offline");
    };

    loadPresence();
    const timer = setInterval(loadPresence, 10000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [getPresence, profile?.id]);

  useEffect(() => {
    if (!currentUser?.id) {
      return undefined;
    }

    const socket = new WebSocket(buildChatSocketUrl(currentUser.id));
    socketRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const incomingMessage = payload?.message;

        if (!incomingMessage) {
          return;
        }

        const isRelatedMessage =
          String(incomingMessage.senderUserId) === String(profile?.id) ||
          String(incomingMessage.receiverUserId) === String(profile?.id);

        if (!isRelatedMessage) {
          return;
        }

        setMessages((prev) => mergeUniqueMessages(prev, [incomingMessage]));
      } catch (error) {
        // ignore malformed payloads
      }
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [currentUser?.id, profile?.id]);

  const handleSend = async () => {
    if (!message.trim()) {
      return;
    }

    const result = await sendChatMessage(profile?.id, message.trim());

    if (!result?.success) {
      setStatusType("error");
      setStatusMessage(result?.message || "Unable to send message.");
      Alert.alert("Chat Locked", result?.message || "Unable to send message.");
      return;
    }

    setMessages((prev) => mergeUniqueMessages(prev, [result.data]));
    setMessage("");
    setStatusMessage("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Chat"
        subtitle={`${profile?.name || "Matrimony chat"} • ${presenceLabel}`}
        navigation={navigation}
        showBack={true}
        showNotification={false}
        backTo="MainTabs"
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
      >
        <View style={styles.body}>
          <InlineMessage type={statusType} text={statusMessage} />

          <FlatList
            data={messages}
            keyExtractor={(item, index) =>
              item?.id != null
                ? `message-${item.id}`
                : `message-${item?.senderUserId}-${item?.receiverUserId}-${item?.sentAt || index}`
            }
            contentContainerStyle={styles.chatList}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={
              Platform.OS === "ios" ? "interactive" : "on-drag"
            }
            renderItem={({ item, index }) => {
              const previous = index > 0 ? messages[index - 1] : null;
              const showDate =
                !previous ||
                formatMessageDate(previous.sentAt) !==
                  formatMessageDate(item.sentAt);

              return (
                <>
                  {showDate ? (
                    <View style={styles.dateRow}>
                      <Text style={styles.dateText}>
                        {formatMessageDate(item.sentAt)}
                      </Text>
                    </View>
                  ) : null}

                  <View
                    style={[
                      styles.bubbleRow,
                      item.mine ? styles.myRow : styles.otherRow,
                    ]}
                  >
                    <View style={[styles.bubble, item.mine && styles.myBubble]}>
                      <Text
                        style={[styles.bubbleText, item.mine && styles.myText]}
                      >
                        {item.text}
                      </Text>

                      <View style={styles.metaRow}>
                        <Text
                          style={[styles.timeText, item.mine && styles.myTimeText]}
                        >
                          {formatMessageTime(item.sentAt)}
                        </Text>

                        {getMessageTick(item) ? (
                          <Ionicons
                            name={getMessageTick(item)}
                            size={14}
                            color={item.read ? "#BFDBFE" : "#E5E7EB"}
                          />
                        ) : null}
                      </View>
                    </View>
                  </View>
                </>
              );
            }}
          />
        </View>

        <View style={styles.emojiRow}>
          {QUICK_EMOJIS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={styles.emojiBtn}
              activeOpacity={0.85}
              onPress={() => setMessage((prev) => `${prev}${emoji}`)}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type message..."
            value={message}
            onChangeText={setMessage}
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Ionicons name="send" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  keyboardView: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  chatList: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  dateRow: {
    alignItems: "center",
    marginBottom: 10,
    marginTop: 6,
  },
  dateText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "800",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  bubbleRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  myRow: {
    justifyContent: "flex-end",
  },
  otherRow: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "78%",
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 18,
  },
  myBubble: { alignSelf: "flex-end", backgroundColor: COLORS.primary },
  bubbleText: { color: COLORS.text, fontWeight: "600" },
  myText: { color: COLORS.white },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    marginTop: 6,
  },
  timeText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "700",
  },
  myTimeText: {
    color: "#E5E7EB",
  },
  emojiRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  emojiBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emojiText: {
    fontSize: 18,
  },
  inputRow: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: COLORS.white,
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    backgroundColor: COLORS.bg,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
