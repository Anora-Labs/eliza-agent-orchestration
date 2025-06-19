import React from "react";

interface VoiceVisualizationProps {
  isAssistantSpeaking: boolean;
}

const VoiceVisualization: React.FC<VoiceVisualizationProps> = ({ isAssistantSpeaking }) => {
  if (!isAssistantSpeaking) return null;

  return (
    <div className="flex items-center justify-center space-x-1 h-8">
      {[1, 2, 3, 4, 5].map((bar) => (
        <div
          key={bar}
          className="h-full w-1.5 bg-primary rounded-full transform transition-transform duration-300"
          style={{
            animation: `voiceBar${bar} 0.8s ease-in-out infinite`,
            animationDelay: `${(bar - 1) * 0.1}s`,
          }}
        />
      ))}

      <style jsx>{`
        @keyframes voiceBar1 {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(0.6); }
        }
        @keyframes voiceBar2 {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1); }
        }
        @keyframes voiceBar3 {
          0%, 100% { transform: scaleY(0.7); }
          50% { transform: scaleY(0.3); }
        }
        @keyframes voiceBar4 {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(0.8); }
        }
        @keyframes voiceBar5 {
          0%, 100% { transform: scaleY(0.6); }
          50% { transform: scaleY(0.4); }
        }
      `}</style>
    </div>
  );
};

export default VoiceVisualization; 