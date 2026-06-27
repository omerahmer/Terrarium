import { awsResourceCatalog } from "./aws-schema";

export const awsResources = awsResourceCatalog.map((resource) => ({
  id: resource.id,
  label: resource.label,
  icon: resource.icon,
  category: resource.category,
}));
