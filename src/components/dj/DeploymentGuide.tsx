
import { useState } from "react";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Cloud, Server } from "lucide-react";
import { DeploymentSteps } from "./deployment/DeploymentSteps";
import { TestingGuide } from "./deployment/TestingGuide";

export const DeploymentGuide = () => {
  const [activeStep, setActiveStep] = useState(0);

  const deploymentSteps = [
    {
      title: "Prepare Server Code",
      description: "Ensure your streaming server is ready for deployment",
      completed: true
    },
    {
      title: "Deploy to DigitalOcean", 
      description: "Set up your streaming server on DigitalOcean",
      completed: true
    },
    {
      title: "Deploy Infrastructure",
      description: "Upload and configure the streaming server",
      completed: false
    },
    {
      title: "Update Environment",
      description: "Configure production URLs in your frontend",
      completed: false
    },
    {
      title: "Test & Go Live",
      description: "Verify OBS integration and start streaming",
      completed: false
    }
  ];

  return (
    <div className="space-y-6">
      <GlassmorphicCard>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Cloud className="h-6 w-6" />
            Streaming Infrastructure Deployment
          </h2>
          <div className="text-sm text-muted-foreground">
            Required for OBS integration
          </div>
        </div>

        <DeploymentSteps steps={deploymentSteps} activeStep={activeStep} />
        
        <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Server className="h-5 w-5 text-green-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-400 mb-1">DigitalOcean Server Status</h4>
              <p className="text-sm text-green-300 mb-2">
                Your streaming server is deployed and running on DigitalOcean.
              </p>
              <div className="bg-slate-800 p-3 rounded font-mono text-sm space-y-1">
                <div>✅ <strong>RTMP Server:</strong> rtmp://67.205.179.77:1935/live</div>
                <div>✅ <strong>HTTPS API:</strong> https://67.205.179.77:3443</div>
                <div>✅ <strong>HLS Streaming:</strong> Available via HTTPS</div>
              </div>
            </div>
          </div>
        </div>
      </GlassmorphicCard>

      <TestingGuide />
    </div>
  );
};
