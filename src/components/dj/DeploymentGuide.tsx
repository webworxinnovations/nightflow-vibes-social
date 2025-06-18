
import { useState } from "react";
import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Cloud } from "lucide-react";
import { DeploymentSteps } from "./deployment/DeploymentSteps";
import { PlatformTabs } from "./deployment/PlatformTabs";
import { FrontendConfiguration } from "./deployment/FrontendConfiguration";
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
      title: "Choose Platform", 
      description: "Select Railway, DigitalOcean, or Heroku for deployment",
      completed: false
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
        <PlatformTabs />
      </GlassmorphicCard>

      <FrontendConfiguration />
      <TestingGuide />
    </div>
  );
};
