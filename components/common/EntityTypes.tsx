export const EntityTypes = {
  account: {
    label: 'Account',
    value: 'account',
    mandatory: true,
    description: 'Mandatory base entity for any user or organisation.',
  },
  organisation: {
    label: 'Organisation',
    value: 'organisation',
    mandatory: false,
    description: 'Optional entity representing a customer or business.',
  },
  directorate: {
    label: 'Directorate',
    value: 'directorate',
    mandatory: false,
    description: 'Optional entity representing a department within an organisation.',
  },
  service: {
    label: 'Service',
    value: 'service',
    mandatory: false,
    description: 'Optional functional unit within a directorate.',
  },
  team: {
    label: 'Team',
    value: 'team',
    mandatory: false,
    description: 'Optional group of users collaborating on common goals.',
  },
  user: {
    label: 'User',
    value: 'user',
    mandatory: true,
    description: 'Mandatory entity representing an individual user.',
  },
};

// Define EntityType explicitly
export type EntityType = keyof typeof EntityTypes;

// Utility to validate hierarchy
export const isValidHierarchy = (parent: EntityType, child: EntityType): boolean => {
  const hierarchy: Record<EntityType, EntityType[]> = {
    account: ['organisation'],
    organisation: ['directorate', 'service', 'team', 'user'],
    directorate: ['service', 'team'],
    service: ['team', 'user'],
    team: ['user'],
    user: [], // user cannot have child entities
  };

  return hierarchy[parent]?.includes(child) || false;
};
