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
      <h1 className="text-6xl sm:text-7xl  bg-linear-to-r from-amber-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent text-center">
        Multi-Model AI Chat
      </h1>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div
          className={`px-4 py-2 rounded-full  text-sm ${aiReady ? "bg-green-500/20 text-green-300 border border-green-500/30" : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/0"}`}
        >
          {aiReady ? "🟢 AI READY" : "🟡 Wating for Ai..."}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-300 text-sm">Model:</span>
          <select
            value={selectedModel}
            onChange={handelModelChange}
            disabled={!aiReady}
            className="bg-orange-950/80 border border-orange-500/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {models.map((m) => (
              <option
                key={m.id}
                value={m.id}
                className="bg-amber-950 open:border-0"
              >
                {m.name} ({m.provider})
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="w-full max-w-2xl bg-linear-to-br from-orange-950/90 to-amber-950 backdrop-blur-md border border-orange-800/50 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center mb-4 p-2 bg-linear-to-r from-orange-600/20 to-red-500/20 rounded-xl border border-orange-500/30">
          <span className="text-orange-300 text-sm font-medium">
            🤖 Currently using: {currentModel.name} ({currentModel.provider})
          </span>
        </div>
        <div className="h-96 overflow-y-auto border-b border-gray-600 mb-6 p-4 bg-linear-to-b from-gray-900/50 to-gray-800/50 rounded-2xl">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-20">
              👋 Start the conversation by typing a message below.
              <br />
              <span className="text-xs text-gray-500 mt-2 block">
                Try different AI models to see how they respond!
              </span>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 m-2 rounded-2xl w-fit max-w-[80%] text-wrap ${
                msg.isUser
                  ? "bg-linear-to-r from-orange-500 to-red-500 text-white ml-auto text-right"
                  : "bg-linear-to-r from-amber-600 to-orange-600 text-white "
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          ))}
          {isLoading && (
            <div className="p-3 m-2 rounded-2xl max-w-xs bg-linear-to-r from-amber-600 to-red-600 text-white">
              <div className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                {currentModel.name} is thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef}></div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handelKeyPress}
            placeholder={
              aiReady
                ? `Ask ${currentModel.name} anything...`
                : "Waiting for AI to be ready..."
            }
            disabled={!aiReady || isLoading}
            className="flex-1 px-4 py-3 bg-yellow-900/30 border border-amber-800 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:shadow-xl focus:shadow-amper-700 focus:ring-orange-500 transition duration-400 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={sendMessage}
            disabled={!aiReady || isLoading || !inputValue.trim()}
            className="px-6 py-3 bg-linear-to-r from-orange-400 to-red-400 hover:opacity-80 text-white font-semibold rounded-2xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                Sending
              </div>
            ) : (
              "Send"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
