let selectedAvatarType = "female";
let interviewRole = "Software Engineer";
let chatMessages = [];
let isRecording = false;
let recognition = null;
let speechSynthesis = window.speechSynthesis;

document.addEventListener("DOMContentLoaded", () => {
    const session = StorageManager.get(STORAGE_KEYS.USER_SESSION);
    if (session && session.profile && session.profile.role) {
        interviewRole = session.profile.role;
    }
});

function selectAvatar(element, type) {
    document.querySelectorAll(".avatar-card").forEach(c => c.classList.remove("selected"));
    element.classList.add("selected");
    selectedAvatarType = type;
}

async function startInterview() {
    document.getElementById("interview-setup").style.display = "none";
    document.getElementById("interview-active").style.display = "flex";
    
    const label = document.getElementById("ai-interviewer-label");
    if (selectedAvatarType === "female") {
        label.textContent = "Sarah (HR Manager)";
    } else if (selectedAvatarType === "male") {
        label.textContent = "David (Technical Lead)";
    } else {
        label.textContent = "Engineering Panel";
    }

    chatMessages = [];
    document.getElementById("chat-window").innerHTML = "<div style=\"text-align: center; color: var(--text-muted); font-size: 0.85rem; margin-bottom: 16px;\">Interview started</div>";
    
    // Initial fetch to AI
    appendMessage("model", "Hello! Let's start the interview. Can you introduce yourself and tell me about your background?");
    
    // Request from backend
    try {
        await fetchAIResponse();
    } catch(e) {
        console.error(e);
    }
}

function appendMessage(role, text) {
    const chatWindow = document.getElementById("chat-window");
    const msgDiv = document.createElement("div");
    msgDiv.style.maxWidth = "80%";
    msgDiv.style.padding = "12px 16px";
    msgDiv.style.borderRadius = "12px";
    msgDiv.style.marginBottom = "8px";
    msgDiv.style.lineHeight = "1.5";
    
    if (role === "user") {
        msgDiv.style.background = "var(--primary)";
        msgDiv.style.color = "white";
        msgDiv.style.alignSelf = "flex-end";
        msgDiv.style.borderBottomRightRadius = "4px";
    } else {
        msgDiv.style.background = "var(--surface-low)";
        msgDiv.style.color = "var(--text-color)";
        msgDiv.style.alignSelf = "flex-start";
        msgDiv.style.borderBottomLeftRadius = "4px";
        msgDiv.style.border = "1px solid var(--border-color)";
    }
    
    msgDiv.textContent = text;
    chatWindow.appendChild(msgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    
    chatMessages.push({ role, text });
}

async function fetchAIResponse() {
    try {
        showLoadingIndicator();
        const res = await API.request("/ai/interview/chat", "POST", {
            messages: chatMessages,
            role: interviewRole,
            mode: "typing"
        });
        removeLoadingIndicator();
        if (res.success && res.text) {
            // Check if last message was user to prevent duplicate initial greetings
            if(chatMessages.length > 0 && chatMessages[chatMessages.length-1].role === "user") {
                appendMessage("model", res.text);
                speakText(res.text);
            }
        }
    } catch (e) {
        removeLoadingIndicator();
        console.error(e);
        showToast("Error connecting to interviewer", "error");
    }
}

async function sendChatMessage() {
    const input = document.getElementById("chat-input");
    const text = input.value.trim();
    if (!text) return;
    
    appendMessage("user", text);
    input.value = "";
    
    await fetchAIResponse();
}

function showLoadingIndicator() {
    const chatWindow = document.getElementById("chat-window");
    const id = "loading-" + Date.now();
    const div = document.createElement("div");
    div.id = id;
    div.style.alignSelf = "flex-start";
    div.style.color = "var(--text-muted)";
    div.style.fontSize = "0.9rem";
    div.innerHTML = "<span class=\"material-symbols-outlined\" style=\"animation: pulse 1s infinite;\">more_horiz</span>";
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function removeLoadingIndicator() {
    const chatWindow = document.getElementById("chat-window");
    const nodes = chatWindow.querySelectorAll("div[id^='loading-']");
    nodes.forEach(n => n.remove());
}

// Audio Recording (Speech Recognition)
function toggleAudioRecording() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        showToast("Your browser does not support audio interviews. Please use typing.", "error");
        return;
    }
    
    if (isRecording) {
        recognition.stop();
        isRecording = false;
        document.getElementById("recording-indicator").style.display = "none";
        document.getElementById("mic-btn").classList.remove("btn-error");
        document.getElementById("mic-btn").classList.add("btn-primary");
    } else {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onstart = () => {
            isRecording = true;
            document.getElementById("recording-indicator").style.display = "flex";
            document.getElementById("mic-btn").classList.add("btn-error");
            document.getElementById("mic-btn").classList.remove("btn-primary");
        };
        
        recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            appendMessage("user", transcript);
            await fetchAIResponse();
        };
        
        recognition.onerror = (event) => {
            console.error(event.error);
            showToast("Microphone error: " + event.error, "error");
            isRecording = false;
            document.getElementById("recording-indicator").style.display = "none";
            document.getElementById("mic-btn").classList.remove("btn-error");
            document.getElementById("mic-btn").classList.add("btn-primary");
        };
        
        recognition.onend = () => {
            isRecording = false;
            document.getElementById("recording-indicator").style.display = "none";
            document.getElementById("mic-btn").classList.remove("btn-error");
            document.getElementById("mic-btn").classList.add("btn-primary");
        };
        
        recognition.start();
    }
}

function speakText(text) {
    if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        if(selectedAvatarType === "female") {
            utterance.pitch = 1.2;
        } else if(selectedAvatarType === "male") {
            utterance.pitch = 0.8;
        }
        speechSynthesis.speak(utterance);
    }
}

function endInterview() {
    if(confirm("Are you sure you want to end the interview?")) {
        document.getElementById("interview-active").style.display = "none";
        document.getElementById("interview-setup").style.display = "flex";
        if(speechSynthesis) speechSynthesis.cancel();
        showToast("Interview session ended", "info");
    }
}

