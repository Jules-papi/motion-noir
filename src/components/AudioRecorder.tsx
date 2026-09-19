import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Trash2, Send, Play, Pause, AlertCircle } from 'lucide-react';

interface AudioRecorderProps {
  onSendAudio: (audioBlobUrl: string, durationStr: string, waveform: number[]) => void;
  onCancel: () => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onSendAudio, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const [recordedDuration, setRecordedDuration] = useState('00:00');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(18).fill(12));
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const finalWaveformRef = useRef<number[]>([]);

  // Start recording on mount
  useEffect(() => {
    let isMounted = true;

    async function startRecording() {
      try {
        setErrorMsg(null);
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Microphone recording is not supported in this browser.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!isMounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;

        // Web Audio Analyser for live visualizer
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          audioContextRef.current = ctx;
          const source = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const collectedHeights: number[] = [];

          const updateMeter = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);

            // Compute representative bar heights
            const bars: number[] = [];
            const step = Math.floor(dataArray.length / 18) || 1;
            for (let i = 0; i < 18; i++) {
              const val = dataArray[i * step] || 0;
              // Map 0..255 to 8..28 px
              const height = Math.max(8, Math.min(28, Math.round((val / 255) * 24) + 6));
              bars.push(height);
            }
            setAudioLevels(bars);
            collectedHeights.push(bars[Math.floor(bars.length / 2)] || 14);

            animationFrameRef.current = requestAnimationFrame(updateMeter);
          };
          updateMeter();
        }

        // Set up MediaRecorder
        const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
        const selectedMime = mimeTypes.find(type => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) || '';

        const recorder = selectedMime ? new MediaRecorder(stream, { mimeType: selectedMime }) : new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
          const url = URL.createObjectURL(audioBlob);
          setRecordedBlobUrl(url);

          // Save visual waveform representation
          finalWaveformRef.current = audioLevels.slice(0, 18);
        };

        recorder.start(100);
        setIsRecording(true);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Microphone access denied or unavailable.';
        setErrorMsg(message);
        setIsRecording(false);
      }
    }

    startRecording();

    return () => {
      isMounted = false;
      cleanupResources();
    };
  }, []);

  // Timer while recording
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingSeconds(prev => {
          const next = prev + 1;
          const mins = Math.floor(next / 60).toString().padStart(2, '0');
          const secs = (next % 60).toString().padStart(2, '0');
          setRecordedDuration(`${mins}:${secs}`);
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const cleanupResources = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
  };

  const handleStopRecordingToPreview = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    cleanupResources();
  };

  const handleTogglePreviewPlay = () => {
    if (!previewAudioRef.current && recordedBlobUrl) {
      previewAudioRef.current = new Audio(recordedBlobUrl);
      previewAudioRef.current.onended = () => setIsPlayingPreview(false);
    }

    if (isPlayingPreview) {
      previewAudioRef.current?.pause();
      setIsPlayingPreview(false);
    } else {
      previewAudioRef.current?.play();
      setIsPlayingPreview(true);
    }
  };

  const handleSend = () => {
    if (isRecording && mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        const mins = Math.floor(recordingSeconds / 60).toString().padStart(2, '0');
        const secs = (recordingSeconds % 60).toString().padStart(2, '0');
        cleanupResources();
        onSendAudio(url, `${mins}:${secs}`, audioLevels);
      };
      mediaRecorderRef.current.stop();
      return;
    }

    if (recordedBlobUrl) {
      cleanupResources();
      onSendAudio(recordedBlobUrl, recordedDuration, finalWaveformRef.current.length ? finalWaveformRef.current : audioLevels);
    }
  };

  const handleDiscard = () => {
    cleanupResources();
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    if (recordedBlobUrl) {
      URL.revokeObjectURL(recordedBlobUrl);
    }
    onCancel();
  };

  // If error occurred (e.g. permission blocked)
  if (errorMsg) {
    return (
      <div className="flex items-center justify-between gap-3 p-2.5 px-4 bg-rose-950/40 border border-rose-500/30 rounded-full text-xs animate-fadeIn">
        <div className="flex items-center gap-2 text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="truncate max-w-[220px] sm:max-w-md font-sans">
            {errorMsg.includes('denied') ? 'Microphone permission denied.' : 'Microphone unavailable.'}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDiscard}
            className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs text-white font-medium cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2.5 p-2 px-4 bg-[#181B22] border border-[#E5C590]/40 rounded-full shadow-lg w-full animate-fadeIn">
      {/* Delete / Discard */}
      <button
        type="button"
        onClick={handleDiscard}
        title="Discard Voice Note"
        className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-full transition-colors cursor-pointer shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Recording status or Play Preview */}
      <div className="flex-1 flex items-center justify-center gap-3 min-w-0">
        {isRecording ? (
          <>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="font-mono text-xs text-white font-semibold">{recordedDuration}</span>
            </div>

            {/* Live Audio Visualizer Bars */}
            <div className="flex items-center gap-0.5 sm:gap-1 h-7 overflow-hidden px-1">
              {audioLevels.map((height, i) => (
                <span
                  key={i}
                  style={{ height: `${height}px` }}
                  className="w-1 sm:w-1.5 rounded-full bg-[#E5C590] transition-all duration-75"
                />
              ))}
            </div>
          </>
        ) : (
          /* Preview Mode */
          <div className="flex items-center gap-3 w-full max-w-xs justify-center">
            <button
              type="button"
              onClick={handleTogglePreviewPlay}
              className="p-1.5 rounded-full bg-[#E5C590] text-black hover:bg-[#d9b880] transition-colors cursor-pointer"
            >
              {isPlayingPreview ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />}
            </button>
            <span className="font-mono text-xs text-white">{recordedDuration}</span>
            <div className="flex items-center gap-0.5 sm:gap-1 h-6">
              {(finalWaveformRef.current.length ? finalWaveformRef.current : audioLevels).map((h, i) => (
                <span
                  key={i}
                  style={{ height: `${h}px` }}
                  className={`w-1 rounded-full ${isPlayingPreview ? 'bg-[#E5C590]' : 'bg-white/30'}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        {isRecording ? (
          <button
            type="button"
            onClick={handleStopRecordingToPreview}
            title="Review Voice Note"
            className="p-2 text-zinc-300 hover:text-white bg-white/10 hover:bg-white/15 rounded-full transition-colors cursor-pointer"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>
        ) : null}

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          title="Send Encrypted Voice Note"
          className="p-2.5 rounded-full bg-[#E5C590] hover:bg-[#d9b880] text-black font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
