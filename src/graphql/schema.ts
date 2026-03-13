import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type Service {
    id: ID!
    name: String!
    description: String!
    price: Float!
    image: String!
    duration: String!
    enabled: Boolean
  }

  type Prestataire {
    id: ID!
    name: String!
    role: String!
    image: String!
    rating: Float!
    specialty: String!
  }

  type Amenity {
    name: String!
    image: String!
  }

  type UserLoyalty {
    points: Int!
    tier: String!
    nextReward: Int!
  }

  type ServiceHistory {
    id: ID!
    date: String!
    service: String!
    prestataireId: String!
    points: Int!
  }

  type Recommendation {
    id: ID!
    reason: String!
  }

  type User {
    id: ID!
    email: String!
    name: String
    role: String
    points: Int
    tier: String
  }

  type AuthPayload {
    user: User
    error: String
  }

  type Product {
    id: ID!
    name: String!
    description: String!
    price: Float!
    image: String!
  }

  type Reservation {
    id: ID!
    user: User
    service: Service
    prestataire: Prestataire
    date: String!
    status: String!
  }

  type WaitingComment {
    id: ID!
    user: User!
    comment: String!
    createdAt: String!
  }

  type Query {
    services: [Service!]!
    service(id: ID!): Service
    prestataires: [Prestataire!]!
    amenities: [Amenity!]!
    userLoyalty: UserLoyalty!
    serviceHistory: [ServiceHistory!]!
    recommendations: [Recommendation!]!
    me: User
    clients: [User!]!
    products: [Product!]!
    myReservations(userId: ID): [Reservation!]!
    waitingComments: [WaitingComment!]!
    personnelEvaluations: [Evaluation!]!
  }

  type Evaluation {
    id: ID!
    user: User!
    prestataire: Prestataire!
    rating: Int!
    comment: String
    createdAt: String!
  }

  type Mutation {
    addService(name: String!, description: String!, price: Float!, image: String!, duration: String!): Service!
    addPrestataire(name: String!, role: String!, image: String!, rating: Float!, specialty: String!): Prestataire!
    login(email: String!, password: String!): AuthPayload!
    register(email: String!, password: String!, name: String!): AuthPayload!
    syncGoogleUser(email: String!, name: String!): AuthPayload!
    createReservation(userId: ID!, serviceId: ID!, prestataireId: ID!, date: String!): Reservation!
    addWaitingComment(userId: ID!, comment: String!): WaitingComment!
    addTip(userId: ID!, prestataireId: ID!, amount: Float!): Boolean
    applyReferral(userId: ID!, code: String!): Boolean
    addPersonnelEvaluation(userId: ID!, personnelId: ID!, rating: Int!, comment: String!): Boolean
    deleteReservation(id: ID!): Boolean
    toggleService(id: ID!, enabled: Boolean!): Service!
    removeService(id: ID!): Boolean
    updateService(id: ID!, name: String, description: String, price: Float, image: String, duration: String): Service!
    updateUserRole(userId: ID!, role: String!): User!
    updateUser(userId: ID!, email: String, name: String, role: String, password: String, tier: String): User!
    removeUser(userId: ID!): Boolean
    addProduct(name: String!, description: String!, price: Float!, image: String!): Product!
    updateProduct(id: ID!, name: String, description: String, price: Float, image: String): Product!
    removeProduct(id: ID!): Boolean
    updateReservationStatus(id: ID!, status: String!): Reservation!
  }
`;
