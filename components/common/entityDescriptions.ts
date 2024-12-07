// /components/common/entityDescriptions.ts

export const entityDescriptions = {
  organisation: {
    title: 'Organization',
    description: 'An entity or entity group that represents a distinct customer or user of the LocalGov AI system. Organizations form the foundational structure of your account, enabling comprehensive management and reporting capabilities across all hierarchical levels.',
    longDescription: 'Organizations can be associated with an account and may have one or more instances. They serve as the primary container for directorates, services, and teams, facilitating organized data management and streamlined operations. Organizations enable effective resource allocation, user management, and performance tracking across all subordinate entities.'
  },
  directorate: {
    title: 'Directorate',
    description: 'A sub-group within an organization, typically representing a specific department or focus area.',
    longDescription: 'Directorates can include multiple services and teams can be directly linked to a directorate. They provide an intermediate organizational layer that helps in managing larger organizations with distinct departmental structures. Directorates enable focused reporting and resource management while maintaining clear hierarchical relationships.'
  },
  service: {
    title: 'Service',
    description: 'A collection of related teams forming a functional unit with a shared purpose.',
    longDescription: 'Services can be within a directorate or directly linked to an organization. They aggregate users, products, and reporting capabilities. Services provide a flexible organizational structure that can adapt to various operational needs while maintaining efficient resource management and clear communication channels.'
  },
  team: {
    title: 'Team',
    description: 'A group of users collaborating to achieve common goals within your organization.',
    longDescription: 'Teams operate as collective units within the system, capable of being associated with multiple products including knowledge bases, journeys, and robotic process automation. They can be linked to services, directorates, or directly to organizations, providing maximum flexibility in organizational structure.'
  }
};