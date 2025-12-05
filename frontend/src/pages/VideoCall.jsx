import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Stack,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Videocam,
  VideocamOff,
  Mic,
  MicOff,
  CallEnd,
  ScreenShare,
  StopScreenShare,
  Settings,
  ArrowBack
} from '@mui/icons-material';

const VideoCall = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [localStream, setLocalStream] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEndDialog, setShowEndDialog] = useState(false);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    initializeCall();
    
    return () => {
      // Cleanup: stop all tracks when component unmounts
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initializeCall = async () => {
    try {
      setIsLoading(true);
      
      // Request camera and microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      setLocalStream(stream);
      
      // Attach stream to video element
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setIsLoading(false);
      setError(null);
      
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Could not access camera or microphone. Please check permissions.');
      setIsLoading(false);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: 'always'
          }
        });
        
        // Replace video track with screen share track
        const screenTrack = screenStream.getVideoTracks()[0];
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        // When user stops sharing via browser UI
        screenTrack.onended = () => {
          setIsScreenSharing(false);
          if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
          }
        };
        
        setIsScreenSharing(true);
      } else {
        // Stop screen sharing and return to camera
        if (localVideoRef.current && localStream) {
          localVideoRef.current.srcObject = localStream;
        }
        setIsScreenSharing(false);
      }
    } catch (err) {
      console.error('Error sharing screen:', err);
      setError('Could not share screen');
    }
  };

  const endCall = () => {
    // Stop all tracks
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    // Navigate back to appointments
    navigate('/appointments');
  };

  const handleEndCallClick = () => {
    setShowEndDialog(true);
  };

  const confirmEndCall = () => {
    setShowEndDialog(false);
    endCall();
  };

  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        bgcolor="#1a1a1a"
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={60} sx={{ color: 'white' }} />
          <Typography variant="h6" color="white">
            Setting up video call...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        bgcolor: '#1a1a1a',
        display: 'flex',
        flexDirection: 'column',
        p: 2
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2 
        }}
      >
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/appointments')}
          sx={{ color: 'white' }}
        >
          Back to Appointments
        </Button>
        <Typography variant="h6" color="white">
          Room ID: {roomId}
        </Typography>
        <Box width={150} /> {/* Spacer for centering */}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Video Container */}
      <Box 
        sx={{ 
          flex: 1,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '3fr 1fr' },
          gap: 2,
          mb: 2
        }}
      >
        {/* Remote Video (Main) */}
        <Paper 
          sx={{ 
            position: 'relative',
            bgcolor: '#2a2a2a',
            borderRadius: 2,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: { xs: 300, md: 500 }
          }}
        >
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}
          >
            <Typography variant="h6" color="white" gutterBottom>
              Waiting for other participant...
            </Typography>
            <Typography variant="body2" color="grey.400">
              Share the room ID with the patient to join
            </Typography>
          </Box>
        </Paper>

        {/* Local Video (Picture-in-Picture) */}
        <Paper 
          sx={{ 
            position: 'relative',
            bgcolor: '#2a2a2a',
            borderRadius: 2,
            overflow: 'hidden',
            minHeight: { xs: 200, md: 300 }
          }}
        >
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)' // Mirror effect
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              bgcolor: 'rgba(0,0,0,0.6)',
              px: 1,
              py: 0.5,
              borderRadius: 1
            }}
          >
            <Typography variant="caption" color="white">
              You
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* Controls */}
      <Paper 
        sx={{ 
          bgcolor: '#2a2a2a',
          p: 2,
          borderRadius: 2
        }}
      >
        <Stack 
          direction="row" 
          spacing={2} 
          justifyContent="center"
          alignItems="center"
        >
          {/* Microphone Toggle */}
          <IconButton
            onClick={toggleAudio}
            sx={{
              bgcolor: isAudioEnabled ? 'primary.main' : 'error.main',
              color: 'white',
              '&:hover': {
                bgcolor: isAudioEnabled ? 'primary.dark' : 'error.dark'
              },
              width: 56,
              height: 56
            }}
          >
            {isAudioEnabled ? <Mic /> : <MicOff />}
          </IconButton>

          {/* Video Toggle */}
          <IconButton
            onClick={toggleVideo}
            sx={{
              bgcolor: isVideoEnabled ? 'primary.main' : 'error.main',
              color: 'white',
              '&:hover': {
                bgcolor: isVideoEnabled ? 'primary.dark' : 'error.dark'
              },
              width: 56,
              height: 56
            }}
          >
            {isVideoEnabled ? <Videocam /> : <VideocamOff />}
          </IconButton>

          {/* Screen Share Toggle */}
          <IconButton
            onClick={toggleScreenShare}
            sx={{
              bgcolor: isScreenSharing ? 'success.main' : 'grey.700',
              color: 'white',
              '&:hover': {
                bgcolor: isScreenSharing ? 'success.dark' : 'grey.600'
              },
              width: 56,
              height: 56
            }}
          >
            {isScreenSharing ? <StopScreenShare /> : <ScreenShare />}
          </IconButton>

          {/* End Call */}
          <IconButton
            onClick={handleEndCallClick}
            sx={{
              bgcolor: 'error.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'error.dark'
              },
              width: 64,
              height: 64
            }}
          >
            <CallEnd />
          </IconButton>

          {/* Settings */}
          <IconButton
            sx={{
              bgcolor: 'grey.700',
              color: 'white',
              '&:hover': {
                bgcolor: 'grey.600'
              },
              width: 56,
              height: 56
            }}
          >
            <Settings />
          </IconButton>
        </Stack>
      </Paper>

      {/* End Call Confirmation Dialog */}
      <Dialog open={showEndDialog} onClose={() => setShowEndDialog(false)}>
        <DialogTitle>End Video Call?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to end this video call?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEndDialog(false)}>
            Cancel
          </Button>
          <Button onClick={confirmEndCall} color="error" variant="contained">
            End Call
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VideoCall;
