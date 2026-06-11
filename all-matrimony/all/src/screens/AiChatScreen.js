import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Header from "../components/Header";
import AssistantAvatar from "../components/AssistantAvatar";
import { API_BASE_URL } from "../config/api";
import { COLORS } from "../constants/colors";
import { useMatrimony } from "../context/MatrimonyContext";

const WEB_RECORDER_MIME_TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];

function pickWebRecorderMimeType() {
  if (typeof MediaRecorder === "undefined" || typeof MediaRecorder.isTypeSupported !== "function") {
    return "";
  }

  return WEB_RECORDER_MIME_TYPES.find((mimeType) => MediaRecorder.isTypeSupported(mimeType)) || "";
}

function sanitizeFileName(name) {
  return String(name || "voice-message").replace(/[^a-zA-Z0-9._-]/g, "_");
}

export default function AiChatScreen({ navigation }) {
  const { appTheme, language, myProfile, currentUser } = useMatrimony();
  const isTelugu = language === "te";
  const aiLanguage = isTelugu ? "te" : "en";
  const speechLanguage = "en-US";
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 16) + 132;

  const scrollViewRef = useRef(null);
  const inputRef = useRef(null);
  const nativeRecordingRef = useRef(null);
  const webRecorderRef = useRef(null);
  const webStreamRef = useRef(null);
  const webChunksRef = useRef([]);
  const webMimeTypeRef = useRef("");

  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "ai",
      text: "Hi! I am your All Matrimony AI Assistant. Ask me anything about the app or general questions.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceHint, setVoiceHint] = useState("");
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const chatStorageKey = `aiChatHistory:${String(currentUser?.id || myProfile?.id || "guest")}`;
  const defaultMessages = [
    {
      id: "welcome",
      sender: "ai",
      text: "Hi! I am your All Matrimony AI Assistant. Ask me anything about the app or general questions.",
    },
  ];

  const quickPrompts = useMemo(
    () => [
      "How do I create or edit my profile?",
      "How does admin approval work?",
      "How do I book a wedding service?",
      "What are the support contacts?",
    ],
    []
  );

  const theme = {
    bg: appTheme?.bg || "#F7F7FF",
    card: appTheme?.card || COLORS.white,
    text: appTheme?.text || "#171027",
    muted: appTheme?.muted || "#6B6B84",
    border: appTheme?.border || "#E4E4F2",
  };

  const clearWebRecordingResources = () => {
    if (webStreamRef.current) {
      webStreamRef.current.getTracks().forEach((track) => track.stop());
      webStreamRef.current = null;
    }

    webRecorderRef.current = null;
    webChunksRef.current = [];
    webMimeTypeRef.current = "";
  };

  const clearNativeRecordingResources = async () => {
    const recording = nativeRecordingRef.current;
    nativeRecordingRef.current = null;

    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
      } catch (error) {
        // Ignore cleanup failures.
      }
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      // Ignore cleanup failures.
    }
  };

  const stopSpeech = async () => {
    try {
      await Speech.stop();
    } catch (error) {
      // Ignore.
    } finally {
      setIsSpeaking(false);
    }
  };

  const speakReply = async (text) => {
    if (!voiceEnabled || !text) return;

    await stopSpeech();
    Speech.speak(text, {
      language: speechLanguage,
      rate: 0.95,
      pitch: 1,
      onStart: () => setIsSpeaking(true),
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const transcribeAudio = async ({ uri, blob, fileName, mimeType }) => {
    const formData = new FormData();

    if (Platform.OS === "web") {
      formData.append("audio", blob, fileName);
    } else {
      formData.append("audio", {
        uri,
        name: fileName,
        type: mimeType || "audio/m4a",
      });
    }

    formData.append("language", aiLanguage);

    const response = await fetch(`${API_BASE_URL}/api/ai/transcribe`, {
      method: "POST",
      body: formData,
    });

    const rawBody = await response.text();
    let data = {};

    if (rawBody) {
      try {
        data = JSON.parse(rawBody);
      } catch (error) {
        data = { message: rawBody };
      }
    }

    if (!response.ok) {
      throw new Error(data?.message || data?.error || `Transcription failed with status ${response.status}`);
    }

    const transcript = String(data?.text || "").trim();

    if (!transcript) {
      throw new Error("The transcription service returned no text.");
    }

    return transcript;
  };

  const insertTranscript = (text) => {
    setInput(text);
    setVoiceHint("Transcript inserted into the input box.");
    inputRef.current?.focus?.();
  };

  const sendMessage = async (messageText = input) => {
    const text = String(messageText || "").trim();

    if (!text) {
      Alert.alert("Message required", "Please enter your question.");
      return;
    }

    if (loading || isRecording || isTranscribing) {
      Alert.alert("Voice in progress", "Please finish the current recording first.");
      return;
    }

    await stopSpeech();

    const userMessage = {
      id: `user_${Date.now()}`,
      sender: "user",
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          language: aiLanguage,
        }),
      });

      const data = await response.json();

      const aiMessage = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        text: data?.reply || "Sorry, I could not generate a reply.",
      };

      setMessages((prev) => [...prev, aiMessage]);
      await speakReply(aiMessage.text);
    } catch (error) {
      const errorMessage = "AI chat is not available right now. Please check the backend or API key.";

      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: "ai",
          text: errorMessage,
        },
      ]);

      await speakReply(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const startVoiceInput = async () => {
    if (loading || isTranscribing || isRecording) return;

    try {
      await stopSpeech();
      setVoiceHint("Preparing microphone...");

      if (Platform.OS === "web") {
        if (
          typeof navigator === "undefined" ||
          !navigator.mediaDevices ||
          typeof navigator.mediaDevices.getUserMedia !== "function" ||
          typeof MediaRecorder === "undefined"
        ) {
          setVoiceHint("");
          Alert.alert("Voice not supported", "Your browser does not support audio recording.");
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const preferredMimeType = pickWebRecorderMimeType();
        const recorder = preferredMimeType
          ? new MediaRecorder(stream, { mimeType: preferredMimeType })
          : new MediaRecorder(stream);

        webChunksRef.current = [];
        webMimeTypeRef.current = recorder.mimeType || preferredMimeType || "audio/webm";
        webStreamRef.current = stream;
        webRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            webChunksRef.current.push(event.data);
          }
        };

        recorder.onerror = () => {
          setIsRecording(false);
          setIsTranscribing(false);
          setVoiceHint("");
          clearWebRecordingResources();
          Alert.alert("Voice error", "Could not record audio from this browser.");
        };

        recorder.start();
        setIsRecording(true);
        setVoiceHint("Recording... tap the mic again or Stop when you are done.");
        return;
      }

      const permissionResult = await Audio.requestPermissionsAsync();

      if (!permissionResult?.granted) {
        setVoiceHint("");
        Alert.alert("Permission required", "Please allow microphone permission to use voice input.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      nativeRecordingRef.current = recording;
      setIsRecording(true);
      setVoiceHint("Recording... tap the mic again or Stop when you are done.");
    } catch (error) {
      setIsRecording(false);
      setVoiceHint("");
      clearWebRecordingResources();
      await clearNativeRecordingResources();
      Alert.alert("Voice error", "Could not start audio recording.");
    }
  };

  const stopVoiceInput = async () => {
    if (!isRecording || isTranscribing) {
      return;
    }

    setIsRecording(false);
    setIsTranscribing(true);
    setVoiceHint("Transcribing audio...");

    try {
      if (Platform.OS === "web") {
        const recorder = webRecorderRef.current;

        if (!recorder) {
          throw new Error("No web recording was found.");
        }

        const mimeType = webMimeTypeRef.current || recorder.mimeType || "audio/webm";
        const stopped = new Promise((resolve, reject) => {
          recorder.addEventListener("stop", resolve, { once: true });
          recorder.addEventListener(
            "error",
            (event) => {
              reject(event?.error || new Error("Recording failed."));
            },
            { once: true }
          );
        });

        recorder.stop();
        await stopped;

        const chunks = [...webChunksRef.current];
        const blob = new Blob(chunks, { type: mimeType });
        const transcript = await transcribeAudio({
          blob,
          fileName: sanitizeFileName(`voice-${Date.now()}.${mimeType.includes("mp4") ? "m4a" : "webm"}`),
        });

        insertTranscript(transcript);
        clearWebRecordingResources();
        return;
      }

      const recording = nativeRecordingRef.current;

      if (!recording) {
        throw new Error("No native recording was found.");
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      nativeRecordingRef.current = null;

      if (!uri) {
        throw new Error("The recorded audio file could not be created.");
      }

      const transcript = await transcribeAudio({
        uri,
        fileName: sanitizeFileName(`voice-${Date.now()}.m4a`),
        mimeType: "audio/m4a",
      });

      insertTranscript(transcript);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
      }).catch(() => null);
    } catch (error) {
      Alert.alert("Voice error", error?.message || "Could not transcribe audio.");
      setVoiceHint("");
    } finally {
      setIsTranscribing(false);
      setIsRecording(false);
      if (Platform.OS === "web") {
        clearWebRecordingResources();
      }
      if (Platform.OS !== "web") {
        nativeRecordingRef.current = null;
      }
    }
  };

  const toggleVoiceInput = () => {
    if (isTranscribing) {
      return;
    }

    if (isRecording) {
      void stopVoiceInput();
      return;
    }

    void startVoiceInput();
  };

  const startNewChat = async () => {
    if (loading || isRecording || isTranscribing) {
      return;
    }

    await stopSpeech();
    await stopVoiceInput();
    setMessages(defaultMessages);
    setInput("");

    try {
      await AsyncStorage.removeItem(chatStorageKey);
    } catch (error) {
      // Ignore storage cleanup failures.
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadHistory = async () => {
      try {
        const saved = await AsyncStorage.getItem(chatStorageKey);

        if (!mounted) {
          return;
        }

        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          } else {
            setMessages(defaultMessages);
          }
        } else {
          setMessages(defaultMessages);
        }
      } catch (error) {
        if (mounted) {
          setMessages(defaultMessages);
        }
      } finally {
        if (mounted) {
          setHistoryLoaded(true);
        }
      }
    };

    loadHistory();

    return () => {
      mounted = false;
    };
  }, [chatStorageKey]);

  useEffect(() => {
    if (!historyLoaded) {
      return;
    }

    AsyncStorage.setItem(chatStorageKey, JSON.stringify(messages)).catch(() => null);
  }, [chatStorageKey, historyLoaded, messages]);

  useEffect(() => {
    return () => {
      void stopSpeech();
      void clearNativeRecordingResources();
      clearWebRecordingResources();
    };
  }, []);

  const renderMessage = (item) => {
    const isUser = item.sender === "user";

    return (
      <View key={item.id} style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
          {item.text}
        </Text>
      </View>
    );
  };

  const voiceButtonLabel = isTranscribing
    ? "Transcribing..."
    : isRecording
      ? "Recording..."
      : "Record";

  const voiceButtonIcon = isTranscribing ? "cloud-upload-outline" : isRecording ? "mic" : "mic-outline";

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.bg }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
    >
      <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
        <Header
          title="AI Help"
          subtitle={`App guidance for ${myProfile?.name || "your profile"} and general questions`}
          navigation={navigation}
        />

        <ScrollView
          ref={scrollViewRef}
          style={styles.chatScroll}
          contentContainerStyle={[styles.chatContainer, { paddingBottom: bottomPadding }]}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }}
        >
          <View style={[styles.heroCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.heroTop}>
              <View style={styles.heroIcon}>
                <AssistantAvatar size={52} />
              </View>

              <View style={styles.heroCopy}>
                <Text style={[styles.heroTitle, { color: theme.text }]}>Your app guide is here</Text>
                <Text style={[styles.heroText, { color: theme.muted }]}>
                  Ask about profile setup, approval, verification, booking, general questions, or use voice input.
                </Text>
              </View>
            </View>

            <View style={styles.promptWrap}>
              {quickPrompts.map((prompt) => (
                <TouchableOpacity
                  key={prompt}
                  style={[styles.promptChip, { borderColor: theme.border }]}
                  activeOpacity={0.85}
                  onPress={() => void sendMessage(prompt)}
                >
                  <Text style={[styles.promptText, { color: theme.text }]}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.voiceBar}>
              <TouchableOpacity
                style={[
                  styles.voiceButton,
                  (isRecording || isTranscribing) && styles.voiceButtonActive,
                  isTranscribing && styles.voiceButtonDisabled,
                ]}
                activeOpacity={0.85}
                onPress={toggleVoiceInput}
                disabled={isTranscribing}
              >
                <Ionicons
                  name={voiceButtonIcon}
                  size={18}
                  color={isRecording || isTranscribing ? COLORS.white : COLORS.primary}
                />
                <Text
                  style={[
                    styles.voiceButtonText,
                    (isRecording || isTranscribing) && styles.voiceButtonTextActive,
                  ]}
                >
                  {voiceButtonLabel}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.voiceButton,
                  styles.voiceStopButton,
                  !isRecording && styles.voiceButtonDisabled,
                ]}
                activeOpacity={0.85}
                onPress={() => void stopVoiceInput()}
                disabled={!isRecording || isTranscribing}
              >
                <Ionicons name="stop-circle-outline" size={18} color={COLORS.primary} />
                <Text style={styles.voiceStopButtonText}>Stop</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.voiceButton, voiceEnabled && styles.voiceButtonActive]}
                activeOpacity={0.85}
                onPress={() => {
                  setVoiceEnabled((prev) => !prev);
                  if (voiceEnabled) {
                    void stopSpeech();
                  }
                }}
              >
                <Ionicons
                  name={voiceEnabled ? "volume-high" : "volume-mute"}
                  size={18}
                  color={voiceEnabled ? COLORS.white : COLORS.primary}
                />
                <Text style={[styles.voiceButtonText, voiceEnabled && styles.voiceButtonTextActive]}>
                  {voiceEnabled ? "Voice On" : "Voice Off"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.voiceButton, styles.newChatButton]}
                activeOpacity={0.85}
                onPress={() => void startNewChat()}
              >
                <Ionicons name="refresh-outline" size={18} color={COLORS.primary} />
                <Text style={styles.newChatButtonText}>New Chat</Text>
              </TouchableOpacity>
            </View>

            {!!voiceHint && <Text style={[styles.listeningHint, { color: theme.muted }]}>{voiceHint}</Text>}
            <Text style={[styles.listeningHint, { color: theme.muted }]}>
              Tap the mic to record voice. We upload the audio and insert the transcript into the chat box.
            </Text>
          </View>

          {messages.map(renderMessage)}
        </ScrollView>

        {loading && (
          <View style={[styles.loadingBox, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={[styles.loadingText, { color: theme.muted }]}>AI is typing...</Text>
          </View>
        )}

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: theme.card,
              borderTopColor: theme.border,
              paddingBottom: Math.max(insets.bottom, 12),
            },
          ]}
        >
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: theme.text, backgroundColor: theme.bg, borderColor: theme.border }]}
            placeholder="Example: How do I complete my profile?"
            placeholderTextColor={theme.muted}
            value={input}
            onChangeText={setInput}
            multiline
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (loading || isRecording || isTranscribing) && styles.sendButtonDisabled,
            ]}
            activeOpacity={0.9}
            onPress={() => void sendMessage()}
            disabled={loading || isRecording || isTranscribing}
          >
            <Ionicons name="send" size={18} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  chatScroll: {
    flex: 1,
  },
  chatContainer: {
    padding: 16,
  },
  heroCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
  },
  heroTop: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  heroIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EAE4FF",
    alignItems: "center",
    justifyContent: "center",
  },
  heroCopy: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "900",
  },
  heroText: {
    marginTop: 5,
    lineHeight: 20,
    fontWeight: "600",
  },
  promptWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  promptChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  promptText: {
    fontSize: 12,
    fontWeight: "700",
  },
  voiceBar: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    flexWrap: "wrap",
  },
  voiceButton: {
    minWidth: 100,
    flexGrow: 1,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
  },
  voiceButtonActive: {
    backgroundColor: COLORS.primary,
  },
  voiceButtonDisabled: {
    opacity: 0.65,
  },
  voiceButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primary,
  },
  voiceButtonTextActive: {
    color: COLORS.white,
  },
  voiceStopButton: {
    backgroundColor: "#FFF7EF",
    borderColor: "#F2C89A",
  },
  voiceStopButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primary,
  },
  newChatButton: {
    backgroundColor: "#F4F0FF",
    borderColor: "#D9CFFF",
  },
  newChatButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primary,
  },
  listeningHint: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "700",
  },
  bubble: {
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
    maxWidth: "86%",
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    alignSelf: "flex-end",
    borderBottomRightRadius: 5,
  },
  aiBubble: {
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: "#E4E4F2",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "600",
  },
  userText: {
    color: "#FFFFFF",
  },
  aiText: {
    color: "#1F1433",
  },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderTopWidth: 1,
  },
  loadingText: {
    fontWeight: "700",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
});
