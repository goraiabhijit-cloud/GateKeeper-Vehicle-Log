import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { User } from '../types';
import { useAuth } from './AuthContext';
import { audioTones } from '../services/audioTones';
import { CallEncryptionDetails, generateCallSecurityContext } from '../services/cryptoCall';

export type CallStatus = 'idle' | 'calling' | 'incoming' | 'connected' | 'ended';
export type CallType = 'voice' | 'ptt'; // Voice phone or Push-to-Talk Radio

export interface CallLogItem {
  id: string;
  peerId: string;
  peerName: string;
  peerDepartment: string;
  direction: 'incoming' | 'outgoing' | 'missed';
  callType: CallType;
  durationSeconds: number;
  timestamp: number;
  safetyNumber: string;
}

export interface ActiveCallState {
  callId: string;
  peer: User;
  isCaller: boolean;
  status: CallStatus;
  callType: CallType;
  startedAt?: number;
  duration: number; // in seconds
  encryption: CallEncryptionDetails;
  isMuted: boolean;
  isSpeakerMuted: boolean;
  isPttActive: boolean; // Transmitting in Push-to-Talk mode
  isVideoEnabled: boolean;
}

interface CallContextType {
  activeCall: ActiveCallState | null;
  incomingCall: { callId: string; caller: User; encryption: CallEncryptionDetails; callType: CallType } | null;
  callHistory: CallLogItem[];
  isCallDirectoryOpen: boolean;
  audioLevel: number; // 0 - 100 for waveform
  micAvailable: boolean;
  initiateCall: (targetUser: User, callType?: CallType) => void;
  acceptIncomingCall: () => void;
  declineIncomingCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleSpeaker: () => void;
  toggleVideo: () => void;
  setPttActive: (active: boolean) => void;
  openCallDirectory: () => void;
  closeCallDirectory: () => void;
  simulateAnswerByPeer: () => void;
  clearHistory: () => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

const CALL_HISTORY_STORAGE_KEY = 'gatekeeper_call_history_v1';
const CHANNEL_NAME = 'gatekeeper_encrypted_call_bus_v1';

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [activeCall, setActiveCall] = useState<ActiveCallState | null>(null);
  const [incomingCall, setIncomingCall] = useState<{
    callId: string;
    caller: User;
    encryption: CallEncryptionDetails;
    callType: CallType;
  } | null>(null);

  const [isCallDirectoryOpen, setIsCallDirectoryOpen] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [micAvailable, setMicAvailable] = useState(false);

  const [callHistory, setCallHistory] = useState<CallLogItem[]>(() => {
    try {
      const stored = localStorage.getItem(CALL_HISTORY_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [
      {
        id: 'hist_01',
        peerId: 'usr_mgmt_002',
        peerName: 'Priya Sharma (Supervisor)',
        peerDepartment: 'Management',
        direction: 'incoming',
        callType: 'voice',
        durationSeconds: 94,
        timestamp: Date.now() - 3600000 * 2,
        safetyNumber: '7492 8813 0921 4452',
      },
      {
        id: 'hist_02',
        peerId: 'usr_emp_003',
        peerName: 'Alex Chen (Gate Officer)',
        peerDepartment: 'Employee',
        direction: 'outgoing',
        callType: 'ptt',
        durationSeconds: 28,
        timestamp: Date.now() - 3600000 * 5,
        safetyNumber: '1109 4920 8821 7361',
      },
    ];
  });

  // Save history
  useEffect(() => {
    try {
      localStorage.setItem(CALL_HISTORY_STORAGE_KEY, JSON.stringify(callHistory));
    } catch (e) {
      console.error(e);
    }
  }, [callHistory]);

  const channelRef = useRef<BroadcastChannel | null>(null);
  const timerRef = useRef<number | null>(null);
  const autoAnswerTimeoutRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Set up BroadcastChannel for multi-tab real-time signaling
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;

    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;

    channel.onmessage = (event: MessageEvent) => {
      const { type, payload } = event.data;
      if (!currentUser) return;

      if (type === 'CALL_OFFER') {
        // Someone is calling this user!
        if (payload.targetUserId === currentUser.id) {
          audioTones.startRinging(true);
          setIncomingCall({
            callId: payload.callId,
            caller: payload.caller,
            encryption: payload.encryption,
            callType: payload.callType,
          });
        }
      } else if (type === 'CALL_ANSWERED') {
        // Other end answered
        if (activeCall && activeCall.callId === payload.callId && activeCall.isCaller) {
          audioTones.playConnectedChime();
          setActiveCall(prev => (prev ? { ...prev, status: 'connected', startedAt: Date.now() } : null));
        }
      } else if (type === 'CALL_DECLINED' || type === 'CALL_HANGUP') {
        // Other end hung up
        if (activeCall && activeCall.callId === payload.callId) {
          audioTones.playDisconnectTone();
          endCallCleanup();
        }
        if (incomingCall && incomingCall.callId === payload.callId) {
          audioTones.stopRinging();
          setIncomingCall(null);
        }
      } else if (type === 'PTT_TRANSMIT') {
        // In Push-to-Talk mode, remote party started or stopped talking
        if (activeCall && activeCall.callId === payload.callId) {
          if (payload.isTransmitting) {
            audioTones.playRogerBeep();
          }
        }
      }
    };

    return () => {
      channel.close();
    };
  }, [currentUser, activeCall, incomingCall]);

  // Audio level analyser for waveform visualization
  const startAudioAnalyser = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        mediaStreamRef.current = stream;
        setMicAvailable(true);

        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateLevel = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          // Scale to 0 - 100
          setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
          animFrameRef.current = requestAnimationFrame(updateLevel);
        };
        updateLevel();
      }
    } catch {
      // Fallback: simulated active speech waveform during call
      setMicAvailable(false);
      const simInterval = window.setInterval(() => {
        setAudioLevel(Math.floor(25 + Math.random() * 55));
      }, 150);
      return () => clearInterval(simInterval);
    }
  };

  const stopAudioAnalyser = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  };

  // Timer for active connected call duration
  useEffect(() => {
    if (activeCall && activeCall.status === 'connected') {
      timerRef.current = window.setInterval(() => {
        setActiveCall(prev => (prev ? { ...prev, duration: prev.duration + 1 } : null));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeCall?.status]);

  /**
   * Initiate an Encrypted Voice or PTT Call
   */
  const initiateCall = (targetUser: User, callType: CallType = 'voice') => {
    if (!currentUser) return;
    if (targetUser.id === currentUser.id) return;

    // Generate E2EE encryption context & safety number
    const encryption = generateCallSecurityContext(currentUser.id, targetUser.id);
    const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    audioTones.startRinging(false);
    startAudioAnalyser();

    const newCallState: ActiveCallState = {
      callId,
      peer: targetUser,
      isCaller: true,
      status: 'calling',
      callType,
      duration: 0,
      encryption,
      isMuted: false,
      isSpeakerMuted: false,
      isPttActive: false,
      isVideoEnabled: false,
    };

    setActiveCall(newCallState);
    setIsCallDirectoryOpen(false);

    // Broadcast call offer via BroadcastChannel to other tabs/windows
    channelRef.current?.postMessage({
      type: 'CALL_OFFER',
      payload: {
        callId,
        caller: currentUser,
        targetUserId: targetUser.id,
        encryption,
        callType,
      },
    });

    // Provide automatic responder fallback after 4 seconds if testing solo
    if (autoAnswerTimeoutRef.current) clearTimeout(autoAnswerTimeoutRef.current);
    autoAnswerTimeoutRef.current = window.setTimeout(() => {
      // If still calling, simulate auto-answer for testing convenience
      setActiveCall(prev => {
        if (prev && prev.callId === callId && prev.status === 'calling') {
          audioTones.playConnectedChime();
          return { ...prev, status: 'connected', startedAt: Date.now() };
        }
        return prev;
      });
    }, 4500);
  };

  /**
   * Accept an incoming call
   */
  const acceptIncomingCall = () => {
    if (!incomingCall || !currentUser) return;

    audioTones.playConnectedChime();
    startAudioAnalyser();

    const acceptedState: ActiveCallState = {
      callId: incomingCall.callId,
      peer: incomingCall.caller,
      isCaller: false,
      status: 'connected',
      callType: incomingCall.callType,
      startedAt: Date.now(),
      duration: 0,
      encryption: incomingCall.encryption,
      isMuted: false,
      isSpeakerMuted: false,
      isPttActive: false,
      isVideoEnabled: false,
    };

    setActiveCall(acceptedState);

    // Broadcast acceptance
    channelRef.current?.postMessage({
      type: 'CALL_ANSWERED',
      payload: { callId: incomingCall.callId },
    });

    setIncomingCall(null);
  };

  /**
   * Decline an incoming call
   */
  const declineIncomingCall = () => {
    if (!incomingCall) return;
    audioTones.stopRinging();

    // Log as missed
    const logItem: CallLogItem = {
      id: `log_${Date.now()}`,
      peerId: incomingCall.caller.id,
      peerName: incomingCall.caller.name,
      peerDepartment: incomingCall.caller.department,
      direction: 'missed',
      callType: incomingCall.callType,
      durationSeconds: 0,
      timestamp: Date.now(),
      safetyNumber: incomingCall.encryption.safetyNumber,
    };
    setCallHistory(prev => [logItem, ...prev.slice(0, 49)]);

    channelRef.current?.postMessage({
      type: 'CALL_DECLINED',
      payload: { callId: incomingCall.callId },
    });

    setIncomingCall(null);
  };

  /**
   * Cleanup call state
   */
  const endCallCleanup = useCallback(() => {
    audioTones.stopRinging();
    stopAudioAnalyser();

    if (autoAnswerTimeoutRef.current) {
      clearTimeout(autoAnswerTimeoutRef.current);
      autoAnswerTimeoutRef.current = null;
    }

    if (activeCall) {
      const logItem: CallLogItem = {
        id: `log_${Date.now()}`,
        peerId: activeCall.peer.id,
        peerName: activeCall.peer.name,
        peerDepartment: activeCall.peer.department,
        direction: activeCall.isCaller ? 'outgoing' : 'incoming',
        callType: activeCall.callType,
        durationSeconds: activeCall.duration,
        timestamp: Date.now(),
        safetyNumber: activeCall.encryption.safetyNumber,
      };
      setCallHistory(prev => [logItem, ...prev.slice(0, 49)]);
    }

    setActiveCall(null);
  }, [activeCall]);

  /**
   * End or hang up an active call
   */
  const endCall = () => {
    if (activeCall) {
      audioTones.playDisconnectTone();
      channelRef.current?.postMessage({
        type: 'CALL_HANGUP',
        payload: { callId: activeCall.callId },
      });
    }
    endCallCleanup();
  };

  /**
   * Manually trigger immediate answer (for demo reviewer)
   */
  const simulateAnswerByPeer = () => {
    if (activeCall && activeCall.status === 'calling') {
      audioTones.playConnectedChime();
      setActiveCall(prev => (prev ? { ...prev, status: 'connected', startedAt: Date.now() } : null));
    }
  };

  const toggleMute = () => {
    setActiveCall(prev => {
      if (!prev) return null;
      const nextMute = !prev.isMuted;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getAudioTracks().forEach(t => {
          t.enabled = !nextMute;
        });
      }
      return { ...prev, isMuted: nextMute };
    });
  };

  const toggleSpeaker = () => {
    setActiveCall(prev => (prev ? { ...prev, isSpeakerMuted: !prev.isSpeakerMuted } : null));
  };

  const toggleVideo = () => {
    setActiveCall(prev => (prev ? { ...prev, isVideoEnabled: !prev.isVideoEnabled } : null));
  };

  const setPttActive = (active: boolean) => {
    setActiveCall(prev => {
      if (!prev) return null;
      if (active && !prev.isPttActive) {
        audioTones.playRogerBeep();
      }
      channelRef.current?.postMessage({
        type: 'PTT_TRANSMIT',
        payload: { callId: prev.callId, isTransmitting: active },
      });
      return { ...prev, isPttActive: active };
    });
  };

  const openCallDirectory = () => setIsCallDirectoryOpen(true);
  const closeCallDirectory = () => setIsCallDirectoryOpen(false);

  const clearHistory = () => {
    setCallHistory([]);
    localStorage.removeItem(CALL_HISTORY_STORAGE_KEY);
  };

  return (
    <CallContext.Provider
      value={{
        activeCall,
        incomingCall,
        callHistory,
        isCallDirectoryOpen,
        audioLevel,
        micAvailable,
        initiateCall,
        acceptIncomingCall,
        declineIncomingCall,
        endCall,
        toggleMute,
        toggleSpeaker,
        toggleVideo,
        setPttActive,
        openCallDirectory,
        closeCallDirectory,
        simulateAnswerByPeer,
        clearHistory,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};
