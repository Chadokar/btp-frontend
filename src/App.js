import React, { useState } from "react";
import "./App.css";

const mimeType = "audio/webm;codecs=opus";

function App() {
  const [transcript, setTranscript] = useState("");
  const [file, setFile] = useState({ blob: null, url: null });
  const [recorder, setRecorder] = useState();
  const [textArray, setTextArray] = useState([]);
  const [error, setError] = useState(null);
  const [buttonStates, setButtonStates] = useState({
    start: true,
    pause: false,
    resume: false,
    stop: false,
    upload: false,
  });

  function handleAnswer() {
    fetch("http://127.0.0.1:8000/answer")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setTextArray(data.text_array);
        console.log(data);
      })
      .catch((error) => {
        setError(error.message);
      });
  }

  function handleFileChange(f) {
    const blob = new Blob(f, { type: mimeType });
    // converts the WebM blob to a WAV blob.
    // const newBlob = await convertWebmToWav(blob);
    const blobURL = URL.createObjectURL(blob);
    setFile({ blob, url: blobURL });
    setButtonStates((x) => ({ ...x, upload: true }));
  }

  let chunks = [];
  async function startRecording(e) {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { autoGainControl: true },
    });
    const recorder = new MediaRecorder(stream, { mimeType });
    chunks = [];

    recorder.ondataavailable = (e) => {
      if (typeof e.data === "undefined" || e.data.size === 0) return;
      chunks.push(e.data);
    };

    recorder.onstop = function () {
      handleFileChange(chunks);
      chunks = [];
    };

    setRecorder(recorder);
    recorder.start(10);
    setButtonStates((x) => ({ ...x, start: false, pause: true, stop: true }));
    document.querySelector(".record").classList.add("recording");
  }

  function pauseRecording(e) {
    if (recorder.state === "recording") {
      recorder.pause();
      setButtonStates((x) => ({
        ...x,
        pause: false,
        resume: true,
      }));
      document.querySelector(".record").classList.remove("recording");
    } else if (recorder.state === "paused") {
      recorder.resume();
      setButtonStates((x) => ({
        ...x,
        pause: true,
        resume: false,
      }));
      document.querySelector(".record").classList.add("recording");
    }
  }

  function stopRecording(e) {
    recorder.stop();
    recorder.stream.getAudioTracks()[0].stop();
    setButtonStates((x) => ({ ...x, start: true, pause: false, stop: false }));
    document.querySelector(".record").classList.remove("recording");
  }

  function uploadToBackend(e) {
    const body = new FormData();
    body.append("file", file.blob);
    fetch(`http://127.0.0.1:8000/transcribe`, {
      method: "POST",
      body,
    })
      .then((res) => res.json())
      .then((data) => {
        setButtonStates((x) => ({ ...x, upload: false }));
        setTranscript(data.transcript || `facing error: ${data.error}`);
      })
      .catch((err) => {
        setButtonStates((x) => ({ ...x, upload: true }));
        console.error(err);
      });
  }

  async function fasthandle(e) {
    // const body = new FormData();
    // body.append("file", file.blob);
    try {
      const response = await fetch("http://127.0.0.1:8000/stemmer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: "Explain the geological processes behind mountain formation",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async function fasthandle(e) {
    // const body = new FormData();
    // body.append("file", file.blob);
    try {
      const response = await fetch("http://127.0.0.1:8000/stemmer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: "Explain the geological processes behind mountain formation",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const arr = [
    "How are mountains formed?",
    "What causes the formation of mountains?",
    "Explain the geological processes behind mountain formation.",
    "Can you describe the process by which mountains are created?",
    "I'm unclear about the origin of mountains � can you explain?",
    "Tell me about the mechanisms that lead to mountain formation.",
    "What geological forces contribute to the creation of mountains?",
    "How do mountains come into existence?",
    "hi can you hear me",
  ];

  async function fastsomehandle(e) {
    // const body = new FormData();
    // body.append("file", file.blob);
    try {
      const response = await fetch("http://127.0.0.1:8000/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          texts: [...arr],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  return (
    <div className="App">
      <h1>Audio Recorder</h1>
      <h2>For audio file</h2>
      <input
        className="fileinput"
        type="file"
        accept="audio/*"
        onChange={(e) => handleFileChange(e.target.files[0])}
      />

      <div className="record">
        <h3>For Voice Recording</h3>
        <button disabled={!buttonStates.start} onClick={startRecording}>
          Start
        </button>
        <button
          disabled={!buttonStates.pause && !buttonStates.resume}
          onClick={pauseRecording}
        >
          {buttonStates.resume ? "Resume" : "Pause"}
        </button>
        <button disabled={!buttonStates.stop} onClick={stopRecording}>
          Stop
        </button>
      </div>

      <audio controls className="player" src={file.url} />

      <button disabled={!buttonStates.upload} onClick={uploadToBackend}>
        Transcribe
      </button>

      <p className="transcript">{transcript}</p>
      <p></p>
      <p></p>
      <h1>Refined questions</h1>
      <button onClick={handleAnswer}>Refined questions</button>
      <ul>
        {textArray.map((text, index) => (
          <li key={index}>{text}</li>
        ))}
      </ul>

      <button onClick={fasthandle}>click</button>
      <h1>th</h1>
      <button onClick={fastsomehandle}>click here</button>
    </div>
  );
}

export default App;
