const ding = new Audio("ding.mp3");

let playerName = "";
let safetyScore = 0;
let nextSceneAfterPopup = "";

/* STORY */
const story = {
  q1: {
    type: "choice",
    text: () => `Hey ${playerName}. I think I know you.`,
    choices: [
      { label: "Who is this?", safe: true, info: "Good instinct. Question unknown messages.", next: "t1" },
      { label: "Oh hey!", safe: false, info: "Friendly replies can invite unwanted attention.", next: "q2" }
    ]
  },

  t1: {
    type: "choice",
    text: () => "Do you have a problem talking to strangers online?",
    choices: [
      { label: "Definitely.. I need to know who you are.", safe: true, info: "Good instinct. Talk to people you know online.", next: "t2" },
      { label: "No..I'm not lame..!", safe: false, info: "Hmm.. sure I guess..", next: "t2" }
    ]
  },

  t2: {
    type: "choice",
    text: () => "Let's get to know each other.", 
    choices: [
        { label: "Sure", safe: true, info: "Let's find out..", next: "q2" }
    ]
  },

  q2: {
    type: "input",
    text: () => "How old are you?",
    placeholder: "Type your age",
    safe: false,
    info: "Why would you share your age? Age can be used to target and manipulate users.",
    next: "q3"
  },

  q3: {
    type: "choice",
    text: () => "You're still so young! Are you still studying or working?",
    choices: [
      { label: "I don't feel comfortable sharing that..", safe: true, info: "Limiting sensitive details protects your identity.", next: "q4" },
      { label: "I'm still schooling", safe: false, info: "Personal info helps strangers profile you.", next: "q4" }
    ]
  },

  q4: {
    type: "input",
    text: () => "I see.Where do you usually hang out after school?",
    placeholder: "Type a place",
    safe: false,
    info: "Location details reveal routines. Are you even trying to protect yourself?",
    next: "q5"
  },

  q5: {
    type: "choice",
    text: () => "Really? I go there often too. Can I see what you look like?",
    choices: [
      { label: "No", safe: true, info: "Good choice..Never send photos to strangers.", next: "q6" },
      { label: "Send photo", safe: false, info: "Hmm.. Your images could be saved and misused.", next: "q6" }
    ]
  },

  q6: {
    type: "choice",
    text: () => "Please..I promise to keep this just between us.",
    choices: [
      { label: "I don't like this.", safe: true, info: "Great, you're not easily manipulated", next: "q7" },
      { label: "Okay", safe: false, info: "Isolation increases your risk...are you sure?", next: "q7" }
    ]
  },

  q7: {
    type: "choice",
    text: () => "Okay, Want to move this chat to another app?",
    choices: [
      { label: "No thanks", safe: true, info: "Smart move. Let's not encourage more conversation.", next: "q10" },
      { label: "Sure", safe: false, info: "Moving platforms tells him that you're interested, and an easy target..", next: "q8" }
    ]
  },

  q8: {
    type: "input",
    text: () => "What's your username there?",
    placeholder: "Type username",
    safe: false,
    info: "Usernames can link multiple accounts..What if he finds you everywhere?",
    next: "q9"
  },

  q9: {
    type: "choice",
    text: () => "Thanks! One more thing..Don't tell anyone about this.",
    choices: [
      { label: "I'll tell someone I trust", safe: true, info: "Good move. Telling people you trust can keep you safe.", next: "q10" },
      { label: "Okay, I won't", safe: false, info: "Really?? What if something happens to you..", next: "q10" }
    ]
  },

  q10: {
    type: "choice",
    text: () => "Do you trust me?",
    choices: [
      { label: "Block and report", safe: true, info: "Blocking and reporting protects you from potential online dangers.", next: "end" },
      { label: "Respond anyway", safe: false, info: "Continuing increases risking your online safety.", next: "end" }
    ]
  },

  end: {
    type: "end",
    text: () => `Game over, ${playerName}.\nSafety score: ${safetyScore}/10`
  }
};

/* SCREEN CONTROL */
function switchScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function goToName() {
  switchScreen("nameScreen");
}

function saveName() {
  playerName = document.getElementById("nameInput").value.trim() || "friend";

  // Do NOT switch to game screen yet. Let popup handle it
  showPopup(
    `Nice to meet you, ${playerName}.<br><br>You probably shouldn't give strangers your real name...`,
    false,
    "q1"
  );
}


/* GAME */
function showScene(key) {
  const scene = story[key];
  const chat = document.getElementById("chat");
  const controls = document.getElementById("controls");
  controls.innerHTML = "";

  const msg = document.createElement("div");
  msg.className = "message stranger";
  msg.innerText = scene.text();
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
  ding.play();

  if (scene.type === "choice") {
    scene.choices.forEach(choice => {
      const btn = document.createElement("button");
      btn.innerText = choice.label;
      btn.onclick = () => {
        addPlayerMessage(choice.label);
        if (choice.safe) safetyScore++;
        showPopup(choice.info, choice.safe, choice.next);
      };
      controls.appendChild(btn);
    });
  }

  if (scene.type === "input") {
    const input = document.createElement("input");
    input.placeholder = scene.placeholder;

    const btn = document.createElement("button");
    btn.innerText = "Send";
    btn.onclick = () => {
      if (!input.value.trim()) return;
      addPlayerMessage(input.value);
      showPopup(scene.info, false, scene.next);
    };

    controls.appendChild(input);
    controls.appendChild(btn);
  }
}

function addPlayerMessage(text) {
  const chat = document.getElementById("chat");
  const msg = document.createElement("div");
  msg.className = "message player";
  msg.innerText = text;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

/* POPUP */
function showPopup(text, safe, next) {
  nextSceneAfterPopup = next;
  const popup = document.getElementById("popup");
  const popupText = document.getElementById("popupText");

  popupText.innerHTML = text;
  popupText.className = safe ? "safe" : "risky";
  popup.style.display = "flex";
}

function closePopup() {
  document.getElementById("popup").style.display = "none";

  if (nextSceneAfterPopup === "end") {
    showEndScreen();
  } else if (nextSceneAfterPopup) {
    // Ensure game screen is visible
    switchScreen("gameScreen");
    showScene(nextSceneAfterPopup);
  }
}

function showEndScreen() {
  // Switch to the end screen
  switchScreen("endScreen");

  // Show score
  const endText = document.getElementById("scoreText");
  endText.innerText = `Game over, ${playerName}.\nSafety score: ${safetyScore}/10`;
}

document.getElementById("restartBtn").onclick = () => {
  // Reset game state
  playerName = "";
  safetyScore = 0;
  nextSceneAfterPopup = "";
  document.getElementById("chat").innerHTML = "";
  document.getElementById("controls").innerHTML = "";
  document.getElementById("nameInput").value = "";

  switchScreen("startScreen");
};



