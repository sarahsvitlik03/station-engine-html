// Fetches the player to appear at the bottom of the page
fetch("player.html")
  .then(r => r.text())
  .then(html => {
    document.getElementById("player-container").innerHTML = html;
    return fetch("songData.json");
  })
  
  .then(res => res.json())
  .then(songData => {

  // code for playing audio
  const audio = document.getElementById("audioPlayer");
  const playIcon = document.getElementById("playIcon");

  playIcon.onclick = function () {
    if(playIcon.classList.contains("fa-play-circle")) {
      playIcon.classList.replace("fa-play-circle", "fa-pause-circle");
      audio.play();
      console.log("music is playing")
    } else {
    playIcon.classList.replace("fa-pause-circle", "fa-play-circle");
    audio.pause();  
  }
};

    //Fetch from iTunes the current song
    fetchSongData(songData.songs[0], "current");

    // Fetch the queued songs from iTunes
    fetchSongData(songData.songs[1], "queue1");
    fetchSongData(songData.songs[2], "queue2");
    fetchSongData(songData.songs[3], "queue3");
    fetchSongData(songData.songs[4], "queue4");
  });


async function fetchSongData(songData, target) {
  const title = songData.song;
  const artist = songData.artist;

  const query = `${artist} ${title}`;
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=1`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.results.length === 0) {
    console.log("No results found");
    return;
  }

  const result = data.results[0];

  // fetch fetch current song from iTunes
  if (target === "current") {
    document.getElementById("track").textContent = result.trackName;
    document.getElementById("artist").textContent = result.artistName;
    document.getElementById("artwork").src = result.artworkUrl100.replace("100x100", "300x300");
  }
  
  // below are all queued songs fetched from itunes 
  if (target === "queue1") {
    document.getElementById("queued-song-1").textContent = result.trackName;
    document.getElementById("queued-artist-1").textContent = result.artistName;
    document.getElementById("queued-cover-1").src = result.artworkUrl100.replace("100x100", "300x300");
  }

  if (target === "queue2") {
    document.getElementById("queued-song-2").textContent = result.trackName;
    document.getElementById("queued-artist-2").textContent = result.artistName;
    document.getElementById("queued-cover-2").src = result.artworkUrl100.replace("100x100", "300x300");
  }

  if (target === "queue3") {
    document.getElementById("queued-song-3").textContent = result.trackName;
    document.getElementById("queued-artist-3").textContent = result.artistName;
    document.getElementById("queued-cover-3").src = result.artworkUrl100.replace("100x100", "300x300");
  }

  if (target === "queue4") {
    document.getElementById("queued-song-4").textContent = result.trackName;
    document.getElementById("queued-artist-4").textContent = result.artistName;
    document.getElementById("queued-cover-4").src = result.artworkUrl100.replace("100x100", "300x300");
  }
}

// Set up MSAL 
const msalConfig = {
  auth: {
    clientId: "dfbed61f-e736-4e3f-8d4a-6a31e1c959ef",
    authority: "https://login.microsoftonline.com/common",
    redirectUri: "http://localhost:5500/login.html"
  },
  cache: {
    cacheLocation: "localStorage",  
    storeAuthStateInCookie: true
  }
};

// Create MSAL Instance
const msalInstance = new msal.PublicClientApplication(msalConfig);

let isInitialized = false;

// Initilaize MSAL function
async function initializeMsal() {
  try {
    await msalInstance.initialize();
    isInitialized = true;  
    
    const response = await msalInstance.handleRedirectPromise();
    
    if (response) {

      // Build User
      const account = response.account;
      const userEmail = account.username;

      fetch ("http://127.0.0.1:3000/checkUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        email: userEmail
        })
      })
      .then (res => res.text())
      .then(result => { 
        window.location.href = "/show.html";
      if (result === "new") {
        window.location.href = "profile-setup.html";
      }
      else if (result === "exists") {
        window.location.href = "index.html";
      }
    });
    } else {
      const currentAccounts = msalInstance.getAllAccounts();
      if (currentAccounts.length > 0) {
        msalInstance.setActiveAccount(currentAccounts[0]);
        console.log("Account already exists:", currentAccounts[0]);
      }
    }
  } catch (error) {
    console.error("error:", error);
  }
}

initializeMsal();
 
async function signIn() {
  if (!isInitialized) {
    await initializeMsal();
  }

  // Handle redirect 
  try {
    await msalInstance.loginRedirect({
      scopes: ["user.read"],
      prompt: "select_account" 
    });
  } catch (error) {
    console.error("Login Error:", error);
  }
}

 /* 
Other things to do: 

// Create a profile setup page -> Send to MySQL to create user 
// Fix issue where on Safari you have to login in twice to redirect
// Make a route for the admin to create a user (ermm i think)
// Work out the flow and any other bugs 
// Do logout button
// Change login to logout when logged out 
// Make the flow on MySQL be listener OR admin. 
// Do logout on the mobile app too 
 */