import { AllAgentConfigsType } from "@/app/types";
import greeter from "./greeter";
import wellbeing from "./wellbeing";

export const allAgentSets: AllAgentConfigsType = {
  wellbeing,
  greeter,
};

// Set wellbeing as the default agent set since it contains our user data agent
export const defaultAgentSetKey = "wellbeing";
