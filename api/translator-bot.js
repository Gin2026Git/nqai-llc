<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <ConversationRelay 
      url="wss://nqai.llc/api/relay"
      transcriptionProvider="Deepgram"
      ttsProvider="ElevenLabs"
      transcriptionLanguage="multi"
      speechModel="flux"
      interruptible="speech"
      interruptSensitivity="medium"
      speechTimeout="800"
      reportInputDuringAgentSpeech="speech"
      ignoreBackchannel="true"
      preemptible="true" />
  </Connect>
</Response>
