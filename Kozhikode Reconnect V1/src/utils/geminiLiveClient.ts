export class GeminiLiveClient {
    private ws: WebSocket | null = null;
    private audioContext: AudioContext | null = null;
    private mediaStream: MediaStream | null = null;
    private workletNode: AudioWorkletNode | null = null;
    private isConnected = false;
    private onAudioCallback: ((audioData: Int16Array) => void) | null = null;

    constructor(private apiKey: string) { }

    async connect() {
        if (!this.apiKey) throw new Error('API Key is missing');

        // Model for Live API: gemini-2.0-flash-exp
        const url = `wss://generative-language.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${this.apiKey}`;

        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
            this.isConnected = true;
            console.log('Gemini Live Connected');
            this.sendSetupMessage();
        };

        this.ws.onmessage = async (event) => {
            // Message is usually Blob or String
            let data = event.data;
            if (data instanceof Blob) {
                data = await data.text();
            }

            try {
                const response = JSON.parse(data);
                this.handleServerMessage(response);
            } catch (e) {
                console.error('Error parsing message', e);
            }
        };

        this.ws.onerror = (err) => {
            console.error('Gemini Live WS Error:', err);
        };

        this.ws.onclose = () => {
            this.isConnected = false;
            console.log('Gemini Live Disconnected');
        };
    }

    private sendSetupMessage() {
        if (!this.ws) return;
        const setupMsg = {
            setup: {
                model: "models/gemini-2.0-flash-exp",
                generation_config: {
                    response_modalities: ["AUDIO"]
                }
            }
        };
        this.ws.send(JSON.stringify(setupMsg));
    }

    async startAudioStream() {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });

        this.mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                channelCount: 1,
                sampleRate: 16000
            }
        });

        // Simple script processor for now (deprecated but widely supported without extra files)
        // Or prefer createScriptProcessor to avoid needing a separate worklet file in src/
        const source = this.audioContext.createMediaStreamSource(this.mediaStream);
        const processor = this.audioContext.createScriptProcessor(4096, 1, 1);

        processor.onaudioprocess = (e) => {
            if (!this.isConnected) return;

            const inputData = e.inputBuffer.getChannelData(0);
            // Convert Float32 to Int16 PCM
            const pcmData = this.floatTo16BitPCM(inputData);

            // Base64 encode
            const base64Audio = this.arrayBufferToBase64(pcmData.buffer);

            this.sendRealtimeInput(base64Audio);
        };

        source.connect(processor);
        processor.connect(this.audioContext.destination);

        // Resume context if needed
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    private floatTo16BitPCM(input: Float32Array) {
        const output = new Int16Array(input.length);
        for (let i = 0; i < input.length; i++) {
            const s = Math.max(-1, Math.min(1, input[i]));
            output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        return output;
    }

    private arrayBufferToBase64(buffer: ArrayBuffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    private sendRealtimeInput(base64Audio: string) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

        const msg = {
            realtime_input: {
                media_chunks: [
                    {
                        mime_type: "audio/pcm",
                        data: base64Audio
                    }
                ]
            }
        };
        this.ws.send(JSON.stringify(msg));
    }

    private handleServerMessage(response: any) {
        if (response.serverContent && response.serverContent.modelTurn) {
            const parts = response.serverContent.modelTurn.parts;
            for (const part of parts) {
                if (part.inlineData && part.inlineData.mimeType.startsWith('audio/pcm')) {
                    const base64 = part.inlineData.data;
                    this.playAudioChunk(base64);
                }
            }
        }
    }

    private nextStartTime = 0;

    private playAudioChunk(base64: string) {
        // Decode base64 to pcm
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const int16Data = new Int16Array(bytes.buffer);

        // Convert back to float for AudioContext
        const floatData = new Float32Array(int16Data.length);
        for (let i = 0; i < int16Data.length; i++) {
            floatData[i] = int16Data[i] / 32768.0;
        }

        if (!this.audioContext) return;

        const buffer = this.audioContext.createBuffer(1, floatData.length, 24000); // Gemini output is 24kHz usually
        buffer.getChannelData(0).set(floatData);

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);

        // Initial scheduling
        const currentTime = this.audioContext.currentTime;
        if (this.nextStartTime < currentTime) {
            this.nextStartTime = currentTime;
        }

        source.start(this.nextStartTime);
        this.nextStartTime += buffer.duration;
    }

    async disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
        if (this.audioContext) {
            await this.audioContext.close();
            this.audioContext = null;
        }
        this.isConnected = false;
    }
}
