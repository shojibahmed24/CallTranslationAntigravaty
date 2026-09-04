import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { CONFIG } from '../../../config/index.js';

class LiveKitProvider {
  constructor() {
    this.apiKey = process.env.LIVEKIT_API_KEY;
    this.apiSecret = process.env.LIVEKIT_API_SECRET;
    this.wsUrl = process.env.LIVEKIT_WS_URL;

    if (this.apiKey && this.wsUrl) {
      this.roomService = new RoomServiceClient(this.wsUrl, this.apiKey, this.apiSecret);
    }
  }

  /**
   * Generates a connection token for a user to join a specific call room.
   */
  async createToken(roomId, participantName, participantIdentity) {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('LiveKit API keys (LIVEKIT_API_KEY, LIVEKIT_API_SECRET) are missing from server configuration.');
    }

    const at = new AccessToken(this.apiKey, this.apiSecret, {
      identity: participantIdentity,
      name: participantName,
    });

    at.addGrant({
      roomJoin: true,
      room: roomId,
      canPublish: true,
      canSubscribe: true,
    });

    return await at.toJwt();
  }

  /**
   * Closes a room forcefully (e.g. when a call ends)
   */
  async closeRoom(roomId) {
    if (this.roomService) {
      try {
        await this.roomService.deleteRoom(roomId);
      } catch (err) {
        console.error(`Failed to close LiveKit room ${roomId}:`, err.message);
      }
    }
  }
}

export const livekitProvider = new LiveKitProvider();
