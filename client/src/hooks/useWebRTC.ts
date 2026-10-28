import { useState, useEffect, useRef, useCallback } from 'react';
import type { Socket } from 'socket.io-client';
import type { Participant } from '../types/poker';

interface UseWebRTCOptions {
  socket: Socket | null;
  currentUserId?: string;
  roomId?: string;
  participants?: Participant[];
}

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

export function useWebRTC({ socket, currentUserId, participants = [] }: UseWebRTCOptions) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const pendingCandidates = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  localStreamRef.current = localStream;

  const hasMediaSupport = typeof navigator !== 'undefined' && 
    Boolean(navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function' && typeof RTCPeerConnection !== 'undefined');

  // Create or retrieve an existing peer connection to target user
  const getOrCreatePeerConnection = useCallback((targetUserId: string, currentStream: MediaStream | null) => {
    let pc = peerConnections.current.get(targetUserId);
    if (pc && pc.signalingState !== 'closed') {
      return pc;
    }

    pc = new RTCPeerConnection(RTC_CONFIG);
    peerConnections.current.set(targetUserId, pc);

    // Add local tracks if available
    if (currentStream) {
      currentStream.getTracks().forEach(track => {
        pc?.addTrack(track, currentStream);
      });
    }

    // Remote track listener
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStreams(prev => {
          const next = new Map(prev);
          next.set(targetUserId, event.streams[0]);
          return next;
        });
      }
    };

    // ICE candidate listener
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('webrtc_ice', {
          targetUserId,
          candidate: event.candidate.toJSON()
        });
      }
    };

    // Cleanup on disconnect
    pc.onconnectionstatechange = () => {
      if (pc?.connectionState === 'disconnected' || pc?.connectionState === 'failed' || pc?.connectionState === 'closed') {
        setRemoteStreams(prev => {
          if (!prev.has(targetUserId)) return prev;
          const next = new Map(prev);
          next.delete(targetUserId);
          return next;
        });
      }
    };

    return pc;
  }, [socket]);

  // Start Camera
  const startCamera = useCallback(async () => {
    if (!hasMediaSupport) {
      setCameraError('Camera not supported in this browser.');
      return;
    }

    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 24 }
        },
        audio: true
      });

      setLocalStream(stream);
      setIsCameraOn(true);
      setIsMuted(false);

      // Offer to all existing remote participants
      if (socket && currentUserId) {
        for (const p of participants) {
          if (p.id !== currentUserId && p.connected) {
            try {
              const pc = getOrCreatePeerConnection(p.id, stream);
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              socket.emit('webrtc_offer', {
                targetUserId: p.id,
                offer
              });
            } catch (err) {
              console.warn(`Error creating WebRTC offer to ${p.id}:`, err);
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Failed to access camera/microphone:', err);
      setCameraError(err.message || 'Could not access camera/mic');
      setIsCameraOn(false);
    }
  }, [hasMediaSupport, socket, currentUserId, participants, getOrCreatePeerConnection]);

  // Stop Camera
  const stopCamera = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    setLocalStream(null);
    setIsCameraOn(false);

    // Close all peer connections
    peerConnections.current.forEach(pc => pc.close());
    peerConnections.current.clear();
    pendingCandidates.current.clear();
    setRemoteStreams(new Map());
  }, []);

  // Toggle Camera
  const toggleCamera = useCallback(async () => {
    if (isCameraOn) {
      stopCamera();
    } else {
      await startCamera();
    }
  }, [isCameraOn, startCamera, stopCamera]);

  // Toggle Mute
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      const newMuted = !isMuted;
      audioTracks.forEach(t => {
        t.enabled = !newMuted;
      });
      setIsMuted(newMuted);
    }
  }, [isMuted]);

  // Socket listener for signaling
  useEffect(() => {
    if (!socket) return;

    // Handle incoming offer
    const handleOffer = async ({ fromUserId, offer }: { fromUserId: string; offer: RTCSessionDescriptionInit }) => {
      try {
        const pc = getOrCreatePeerConnection(fromUserId, localStreamRef.current);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        // Flush any pending ICE candidates for this peer
        const pending = pendingCandidates.current.get(fromUserId) || [];
        for (const c of pending) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(c));
          } catch (e) {
            console.warn('Error applying queued ICE candidate:', e);
          }
        }
        pendingCandidates.current.delete(fromUserId);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('webrtc_answer', {
          targetUserId: fromUserId,
          answer
        });
      } catch (err) {
        console.error('Error handling WebRTC offer:', err);
      }
    };

    // Handle incoming answer
    const handleAnswer = async ({ fromUserId, answer }: { fromUserId: string; answer: RTCSessionDescriptionInit }) => {
      try {
        const pc = peerConnections.current.get(fromUserId);
        if (pc && pc.signalingState !== 'closed') {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));

          // Flush any pending candidates
          const pending = pendingCandidates.current.get(fromUserId) || [];
          for (const c of pending) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(c));
            } catch (e) {
              console.warn('Error applying queued ICE candidate:', e);
            }
          }
          pendingCandidates.current.delete(fromUserId);
        }
      } catch (err) {
        console.error('Error handling WebRTC answer:', err);
      }
    };

    // Handle incoming ICE candidate
    const handleIce = async ({ fromUserId, candidate }: { fromUserId: string; candidate: RTCIceCandidateInit }) => {
      try {
        const pc = peerConnections.current.get(fromUserId);
        if (pc && pc.remoteDescription && pc.remoteDescription.type) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          // Queue candidate until remote description is set
          const existing = pendingCandidates.current.get(fromUserId) || [];
          existing.push(candidate);
          pendingCandidates.current.set(fromUserId, existing);
        }
      } catch (err) {
        console.warn('Error adding ICE candidate:', err);
      }
    };

    socket.on('webrtc_offer', handleOffer);
    socket.on('webrtc_answer', handleAnswer);
    socket.on('webrtc_ice', handleIce);
    socket.on('webrtc_ice_candidate', handleIce);

    return () => {
      socket.off('webrtc_offer', handleOffer);
      socket.off('webrtc_answer', handleAnswer);
      socket.off('webrtc_ice', handleIce);
      socket.off('webrtc_ice_candidate', handleIce);
    };
  }, [socket, getOrCreatePeerConnection]);

  // Clean up when participants leave
  useEffect(() => {
    const activeIds = new Set(participants.map(p => p.id));
    peerConnections.current.forEach((pc, uid) => {
      if (!activeIds.has(uid)) {
        pc.close();
        peerConnections.current.delete(uid);
        pendingCandidates.current.delete(uid);
        setRemoteStreams(prev => {
          if (!prev.has(uid)) return prev;
          const next = new Map(prev);
          next.delete(uid);
          return next;
        });
      }
    });
  }, [participants]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      peerConnections.current.forEach(pc => pc.close());
      peerConnections.current.clear();
      pendingCandidates.current.clear();
    };
  }, []);

  return {
    localStream,
    remoteStreams,
    isCameraOn,
    isMuted,
    cameraError,
    hasMediaSupport,
    startCamera,
    stopCamera,
    toggleCamera,
    toggleMute
  };
}
