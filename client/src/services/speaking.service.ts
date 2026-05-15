import { api } from './api';

export interface SpeakingFeedback {
  transcript: string;
  score: number;
  detectedLevel: string;
  pronunciation: string;
  grammar: string;
  vocabulary: string;
  strengths: string[];
  improvements: string[];
  betterWayToSay: string;
}

export const speakingService = {
  async transcribe(audioBlob: Blob): Promise<SpeakingFeedback> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    const { data } = await api.post('/speaking/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },
};
