"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Square, Loader2 } from "lucide-react";

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  isAnalyzing: boolean;
}

export function VoiceRecorder({ onTranscription, isAnalyzing }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [browserSupported, setBrowserSupported] = useState(true);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptRef = useRef<string>("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check browser support on mount
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setBrowserSupported(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startAudioLevelMonitoring = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(Math.min(100, average * 1.5));
        animationRef.current = requestAnimationFrame(updateLevel);
      };
      
      updateLevel();
    } catch {
      // Audio level monitoring is optional, don't fail if unavailable
    }
  }, []);

  const stopAudioLevelMonitoring = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
  }, []);

  const startRecording = useCallback(async () => {
    setPermissionDenied(false);
    transcriptRef.current = "";
    
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      setBrowserSupported(false);
      return;
    }

    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = "";
        let interimTranscript = "";
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript + " ";
          } else {
            interimTranscript += result[0].transcript;
          }
        }
        
        if (finalTranscript) {
          transcriptRef.current += finalTranscript;
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === "not-allowed") {
          setPermissionDenied(true);
        }
        stopRecording();
      };

      recognition.onend = () => {
        // Only restart if still recording
        if (isRecording && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch {
            // Recognition already started
          }
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Start audio level monitoring
      startAudioLevelMonitoring();
      
    } catch {
      setPermissionDenied(true);
    }
  }, [isRecording, startAudioLevelMonitoring]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    setIsTranscribing(true);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    stopAudioLevelMonitoring();
    
    // Small delay to ensure final transcript is captured
    setTimeout(() => {
      const finalText = transcriptRef.current.trim();
      setIsTranscribing(false);
      if (finalText) {
        onTranscription(finalText);
      }
    }, 500);
  }, [onTranscription, stopAudioLevelMonitoring]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!browserSupported) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
          <Mic className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">Browser Not Supported</h3>
        <p className="text-sm text-muted-foreground">
          Speech recognition is not available in your browser. Please use Chrome, Edge, or Safari for the best experience.
        </p>
      </div>
    );
  }

  if (permissionDenied) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
          <Mic className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">Microphone Access Required</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Please allow microphone access in your browser settings to use voice recording.
        </p>
        <button
          onClick={() => setPermissionDenied(false)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
      {/* Recording Timer */}
      {isRecording && (
        <div className="text-center mb-6 fade-in-up">
          <div className="text-4xl font-mono font-bold text-foreground mb-1">
            {formatTime(recordingTime)}
          </div>
          <p className="text-sm text-muted-foreground">Recording...</p>
        </div>
      )}

      {/* Audio Visualizer */}
      <div className="flex items-center justify-center gap-1 h-16 mb-6">
        {Array.from({ length: 20 }).map((_, i) => {
          const baseHeight = isRecording ? Math.sin(i * 0.5) * 10 + 15 : 4;
          const dynamicHeight = isRecording ? baseHeight + (audioLevel / 100) * 40 : 4;
          return (
            <div
              key={i}
              className="waveform-bar transition-all duration-75"
              style={{
                height: `${Math.max(4, dynamicHeight)}px`,
                opacity: isRecording ? 0.5 + (audioLevel / 200) : 0.3,
              }}
            />
          );
        })}
      </div>

      {/* Record Button */}
      <div className="flex justify-center">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isAnalyzing || isTranscribing}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all ${
            isRecording
              ? "bg-destructive text-destructive-foreground recording-pulse"
              : isAnalyzing || isTranscribing
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30 hover:shadow-primary/40"
          }`}
        >
          {isTranscribing || isAnalyzing ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : isRecording ? (
            <Square className="w-7 h-7" fill="currentColor" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </button>
      </div>

      {/* Instructions */}
      <p className="text-center text-sm text-muted-foreground mt-6">
        {isTranscribing
          ? "Processing your speech..."
          : isAnalyzing
          ? "Analyzing your speech..."
          : isRecording
          ? "Tap the button to stop recording"
          : "Tap the microphone to start recording"}
      </p>
    </div>
  );
}
