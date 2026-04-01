export type TelephonyProviderName = 'ringcentral' | 'twilio' | 'tmobile';
export type CallStatus = 'initiated' | 'dialing' | 'ringing' | 'in_call' | 'completed' | 'failed';

export interface TelephonyProvider {
  name: TelephonyProviderName;
  displayName: string;
  isEnabled: boolean;
  initiateCall: (phoneNumber: string) => Promise<void>;
}

export interface ActiveCall {
  id: string;
  provider: TelephonyProviderName;
  phoneNumber: string;
  status: CallStatus;
  entityType?: string;
  entityId?: string;
  startedAt: Date;
  duration: number;
}

class RingCentralProvider implements TelephonyProvider {
  name: TelephonyProviderName = 'ringcentral';
  displayName = 'RingCentral';
  isEnabled = false;

  async initiateCall(phoneNumber: string): Promise<void> {
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    window.open(`rcmobile://call?number=${encodeURIComponent(cleanNumber)}`, '_blank');
  }
}

class TwilioProvider implements TelephonyProvider {
  name: TelephonyProviderName = 'twilio';
  displayName = 'Twilio';
  isEnabled = false;

  async initiateCall(phoneNumber: string): Promise<void> {
    console.log('Twilio integration coming soon', phoneNumber);
  }
}

class TMobileProvider implements TelephonyProvider {
  name: TelephonyProviderName = 'tmobile';
  displayName = 'T-Mobile';
  isEnabled = false;

  async initiateCall(phoneNumber: string): Promise<void> {
    console.log('T-Mobile integration coming soon', phoneNumber);
  }
}

const providerRegistry: Record<TelephonyProviderName, TelephonyProvider> = {
  ringcentral: new RingCentralProvider(),
  twilio: new TwilioProvider(),
  tmobile: new TMobileProvider(),
};

export function getProvider(name: TelephonyProviderName): TelephonyProvider {
  return providerRegistry[name];
}

export async function fetchEnabledProviders(orgId: string): Promise<{ name: TelephonyProviderName; displayName: string }[]> {
  return [];
}

export async function logCall(params: {
  orgId: string;
  userId: string;
  providerName: TelephonyProviderName;
  phoneNumber: string;
  entityType?: string;
  entityId?: string;
  status: CallStatus;
  rcSessionId?: string;
}) {
  return { id: `temp-${Date.now()}` };
}

export async function updateCallStatus(callId: string, status: CallStatus, durationSeconds?: number) {
  console.log('Call status updated:', callId, status, durationSeconds);
}

export async function checkRCConnectionStatus(): Promise<{
  connected: boolean;
  expired: boolean;
  accountId: string | null;
}> {
  return { connected: false, expired: false, accountId: null };
}

export async function getRCAuthUrl(redirectUri: string): Promise<string> {
  return '';
}

export async function exchangeRCCode(code: string, redirectUri: string): Promise<void> {
  console.log('Exchange code:', code);
}

export async function disconnectRC(): Promise<void> {
  console.log('Disconnected');
}

export async function fetchCallTranscript(callLogId: string): Promise<{
  transcript: string | null;
  recordingUrl: string | null;
}> {
  return { transcript: null, recordingUrl: null };
}
