import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type Service {
    id: ID!
    name: String!
    description: String!
    price: Float!
    price_homme: Float
    price_femme: Float
    image: String
    duration: String!
    enabled: Boolean
    visibility: String
    categoryId: ID
    category: ServiceCategory
  }

  type ServiceCategory {
    id: ID!
    name: String!
    services: [Service!]
  }

  type Prestataire {
    id: ID!
    name: String!
    role: String!
    image: String!
    rating: Float!
    specialty: String!
    historique: String
    satisfied_clients: String
    tech_expertise: Int
    hosp_expertise: Int
    prec_expertise: Int
    award_badge: String
    calendar_color_id: String
    service_id: ID
    service: Service
    evaluations: [Evaluation!]
  }

  type Amenity {
    name: String!
    image: String!
  }

  type UserLoyalty {
    points: Int!
    tier: String!
    nextReward: Int!
    referral_code: String
    referred_by: User
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
    password: String
    hair_color_pref: String
    favorite_coupe: String
    nail_color_pref: String
    music_pref: String
    music_link: String
    drink_pref: String
    skin_type: String
    birthday: String
    phone: String
    coffee_pref: String
    employee_pref: String
    favourite_service: String
    allergies: String
    last_visit_notes: String
    image: String
    is_blocked: Boolean
    referral_code: String
    referred_by: User
  }

  type AuthPayload {
    user: User
    error: String
  }

  type Product {
    id: ID!
    name: String!
    description: String
    price: Float!
    image: String
    is_active: Boolean
  }

  type Drink {
    id: ID!
    name: String!
    image: String
    available: Boolean
  }

  type Reservation {
    id: ID!
    user: User
    service: Service
    prestataire: Prestataire
    date: String!
    status: String!
    duration: Int
    total_price: Float
    paymentMode: String
    externalTitle: String
    google_event_id: String
    drink_choice: String
    genre: String
  }

  type ClientNote {
    id: ID!
    client: User!
    author: User!
    content: String!
    createdAt: String!
  }

  type WaitingComment {
    id: ID!
    user: User!
    comment: String!
    createdAt: String!
  }

  type ExternalEvent {
    id: ID!
    google_event_id: String
    title: String
    startDate: String
    endDate: String
    reservationId: Int
  }

  type Query {
    services: [Service!]!
    service(id: ID!): Service
    prestataires(serviceId: ID): [Prestataire!]!
    prestataire(id: ID!): Prestataire
    amenities: [Amenity!]!
    userLoyalty(userId: ID): UserLoyalty!
    serviceHistory: [ServiceHistory!]!
    recommendations: [Recommendation!]!
    me: User
    clients: [User!]!
    products: [Product!]!
    myReservations(userId: ID): [Reservation!]!
    waitingComments: [WaitingComment!]!
    personnelEvaluations: [Evaluation!]!
    clientNotes(clientId: ID): [ClientNote!]!
    externalEvents: [ExternalEvent!]!
    allDrinks: [Drink!]!
    serviceCategories: [ServiceCategory!]!
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
    addService(name: String!, description: String!, price: Float!, price_homme: Float, price_femme: Float, image: String, duration: String!, visibility: String, categoryId: ID): Service!
    addServiceCategory(name: String!): ServiceCategory!
    addPrestataire(name: String!, role: String!, image: String!, rating: Float!, specialty: String!, satisfied_clients: String, tech_expertise: Int, hosp_expertise: Int, prec_expertise: Int, award_badge: String, calendar_color_id: String, serviceId: ID): Prestataire!
    login(email: String!, password: String!): AuthPayload!
    register(email: String!, password: String!, name: String!): AuthPayload!
    syncGoogleUser(email: String!, name: String!): AuthPayload!
    createReservation(userId: ID!, serviceId: ID!, prestataireId: ID!, date: String!, duration: Int, totalPrice: Float, genre: String): Reservation!
    addWaitingComment(userId: ID!, comment: String!): WaitingComment!
    addTip(userId: ID!, prestataireId: ID!, amount: Float!): Boolean
    convertExternalToReservation(externalId: ID!, userId: ID!, serviceId: ID!, prestataireId: ID!): Reservation!
    generateReferralCode(userId: ID!): User!
    applyReferralCode(userId: ID!, code: String!): User!
    addPersonnelEvaluation(userId: ID!, personnelId: ID!, rating: Int!, comment: String!): Boolean
    deleteReservation(id: ID!): Boolean
    toggleService(id: ID!, enabled: Boolean!): Service!
    removeService(id: ID!): Boolean
    updateService(id: ID!, name: String, description: String, price: Float, price_homme: Float, price_femme: Float, image: String, duration: String, visibility: String, categoryId: ID): Service!
    updateServiceCategory(id: ID!, name: String!): ServiceCategory!
    removeServiceCategory(id: ID!): Boolean!
    updateUserRole(userId: ID!, role: String!): User!
    updateUser(userId: ID!, email: String, name: String, role: String, password: String, tier: String, hair_color_pref: String, favorite_coupe: String, nail_color_pref: String, music_pref: String, music_link: String, drink_pref: String, skin_type: String, birthday: String, phone: String, coffee_pref: String, employee_pref: String, favourite_service: String, allergies: String, last_visit_notes: String, image: String, is_blocked: Boolean): User!
    removeUser(userId: ID!): Boolean
    updateSpecialist(id: ID!, name: String, role: String, image: String, specialty: String, rating: Float, historique: String, satisfied_clients: String, tech_expertise: Int, hosp_expertise: Int, prec_expertise: Int, award_badge: String, calendar_color_id: String, serviceId: ID): Prestataire!
    addProduct(name: String!, description: String, price: Float!, image: String): Product!
    updateProduct(id: ID!, name: String, description: String, price: Float, image: String): Product!
    removeProduct(id: ID!): Boolean
    toggleProduct(id: ID!, is_active: Boolean!): Product!
    updateReservationStatus(id: ID!, status: String!, paymentMode: String): Reservation!
    updateReservationDate(id: ID!, date: String!): Reservation!
    syncGoogleCalendar: Boolean!
    addClientNote(clientId: ID!, authorId: ID!, content: String!): ClientNote!
    deleteSpecialist(id: ID!): Boolean
    deductPoints(userId: ID!, points: Int!): User!
    purchaseProduct(userId: ID!, productId: ID!): Boolean
    addDrink(name: String!, image: String): Drink!
    removeDrink(id: ID!): Boolean
    updateReservationDrink(id: ID!, drinkChoice: String!): Reservation!
  }
`;
