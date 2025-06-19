import rewardsManager from "./rewards-manager";
import pointsCalculator from "./points-calculator";
import habitTracker from "./habit-tracker";
import userDataAgent from "./user-data-agent";
import { injectTransferTools } from "../utils";

// Set up the transfer relationships between agents
rewardsManager.downstreamAgents = [pointsCalculator, habitTracker, userDataAgent];
pointsCalculator.downstreamAgents = [rewardsManager, habitTracker, userDataAgent];
habitTracker.downstreamAgents = [rewardsManager, pointsCalculator, userDataAgent];
userDataAgent.downstreamAgents = [rewardsManager, pointsCalculator, habitTracker];

// Apply transfer tools to all agents
const agents = injectTransferTools([
  rewardsManager,
  pointsCalculator,
  habitTracker,
  userDataAgent,
]);

export default agents;