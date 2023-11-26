import React, { useState } from "react";
import "./App.css";

const backend = "http://127.0.0.1:5000";
const mimeType = "audio/webm;codecs=opus";

function App() {
  const [transcript, setTranscript] = useState("");
  const [file, setFile] = useState({ blob: null, url: null });
  const [recorder, setRecorder] = useState();
  const [buttonStates, setButtonStates] = useState({
    start: true,
    pause: false,
    resume: false,
    stop: false,
    upload: false,
  });

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
  }

  function pauseRecording(e) {
    if (recorder.state === "recording") {
      recorder.pause();
      setButtonStates((x) => ({
        ...x,
        pause: false,
        resume: true,
      }));
    } else if (recorder.state === "paused") {
      recorder.resume();
      setButtonStates((x) => ({
        ...x,
        pause: true,
        resume: false,
      }));
    }
  }

  function stopRecording(e) {
    recorder.stop();
    recorder.stream.getAudioTracks()[0].stop();
    setButtonStates((x) => ({ ...x, start: true, pause: false, stop: false }));
  }

  function uploadToBackend(e) {
    const body = new FormData();
    body.append("file", file.blob);
    fetch(`${backend}/transcribe`, {
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

  return (
    <div className="App">
      <h1>Audio Recorder</h1>

      <input
        className="fileinput"
        type="file"
        accept="audio/*"
        onChange={(e) => handleFileChange(e.target.files[0])}
      />

      <div className="record">
        <h3>Record</h3>
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
    </div>
  );
}

export default App;
