
import { CheckCircle } from "lucide-react";

interface DeploymentStep {
  title: string;
  description: string;
  completed: boolean;
}

interface DeploymentStepsProps {
  steps: DeploymentStep[];
  activeStep: number;
}

export const DeploymentSteps = ({ steps, activeStep }: DeploymentStepsProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step.completed 
                ? 'bg-green-500 text-white' 
                : index === activeStep 
                ? 'bg-blue-500 text-white'
                : 'bg-muted text-muted-foreground'
            }`}>
              {step.completed ? <CheckCircle className="h-4 w-4" /> : index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-2 ${
                step.completed ? 'bg-green-500' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="text-center">
        <h3 className="font-medium">{steps[activeStep]?.title}</h3>
        <p className="text-sm text-muted-foreground">{steps[activeStep]?.description}</p>
      </div>
    </div>
  );
};
