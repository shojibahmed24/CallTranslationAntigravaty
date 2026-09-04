const fs = require('fs');
let code = fs.readFileSync('mobile/src/screens/call/LiveCallScreen.jsx', 'utf8');

const regex = /{activeCall\.livekitToken && \([\s\S]*?<LiveKitRoom[\s\S]*?<\/LiveKitRoom>\s*\)}/;

const replacement = `{activeCall.livekitToken && (
        <div className="absolute inset-0 z-0" style={{ opacity: activeCall?.isVideo ? 1 : 0, pointerEvents: activeCall?.isVideo ? 'auto' : 'none' }}>
          <LiveKitRoom
            serverUrl={import.meta.env.VITE_LIVEKIT_URL || 'ws://localhost:7880'}
            token={activeCall.livekitToken}
            connect={true}
            audio={!isMuted}
            video={!!activeCall?.isVideo}
            data-lk-theme="default"
            style={{ width: '100%', height: '100%', position: 'absolute' }}
            onDisconnected={() => endCurrentCall()}
          >
            {activeCall?.isVideo ? <VideoConference /> : <RoomAudioRenderer />}
          </LiveKitRoom>
        </div>
      )}`;

code = code.replace(regex, replacement);
fs.writeFileSync('mobile/src/screens/call/LiveCallScreen.jsx', code);
