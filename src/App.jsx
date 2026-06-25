import { useState, useEffect, useRef } from "react";
import models from "./models.json";
function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [aiReady, setAiReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const cheackReady = setInterval(() => {
      if (
        window.puter &&
        window.puter.ai &&
        typeof window.puter.ai.chat === "function"
      ) {
        setAiReady(true);
        clearInterval(cheackReady);
      }
    }, 300);
    return () => clearInterval(cheackReady);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessages = (msg, isUser) => {
    setMessages((prev) => [
      ...prev,
      { content: msg, isUser, id: Date.now() + Math.random() },
    ]);
  };

  const sendMessage = async () => {
    const message = inputValue.trim();
    if (!message) return;
    if (!aiReady) {
      addMessages("⏳ AI service is still loading. Please wait...", false);
      return;
    }
    addMessages(message, true);
    setInputValue("");
    setIsLoading(true);
    try {
      const conversation = [
        { role: "system", content: "You are a helpful assistant" },
        ...messages.map((msg) => ({
          role: msg.isUser ? "user" : "assistant",
          content: msg.content,
        })),
        { role: "user", content: message },
      ];
      const response = await window.puter.ai.chat(conversation, {
        model: selectedModel,
      });
      const reply =
        typeof response === "string"
          ? response
          : response.message?.content || "🤖 No reply received";
      addMessages(reply, false);
    } catch (error) {
      addMessages(
        `❌ Error:${error.message || "something went wrong."}`,
        false,
      );
    } finally {
      setIsLoading(false);
    }
  };
  const handelKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  const handelModelChange = (e) => {
    const newModel = e.target.value;
    setSelectedModel(newModel);
    const model = models.find((m) => m.id === newModel);
    addMessages(`🔃 Switched to ${model.name} (${model.provider})`, false);
  };
  const currentModel = models.find((m) => m.id === selectedModel) || models[0];
  return (
    <div className="min-h-screen bg-linear-to-br from-orange-950 via-neutral-950 to-amber-950 flex flex-col items-center justify-center p-4 gap-8">
      <h1 className="text-7xl text-white">
        Multi-Model AI Chat App Starter Code
      </h1>
    </div>
  );
}

export default App;
