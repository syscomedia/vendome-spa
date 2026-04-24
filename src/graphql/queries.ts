import { gql } from '@apollo/client';

export const GET_DASHBOARD_DATA = gql`
  query GetDashboardData($userId: ID) {
    services {
      id
      name
      description
      price
      price_homme
      price_femme
      visibility
      image
      duration
      enabled
      categoryId
    }
    serviceCategories {
      id
      name
    }
    prestataires {
      id
      name
      role
      image
      rating
      specialty
      historique
      satisfied_clients
      tech_expertise
      hosp_expertise
      prec_expertise
      award_badge
      calendar_color_id
      service_id
    }
    amenities {
      name
      image
    }
    userLoyalty(userId: $userId) {
      points
      tier
      nextReward
      referral_code
      referred_by {
        id
        name
      }
    }
    serviceHistory {
      id
      date
      service
      prestataireId
      points
    }
    recommendations {
      id
      reason
    }
    clients {
      id
      name
      email
      role
      points
      tier
      password
      hair_color_pref
      favorite_coupe
      nail_color_pref
      music_pref
      music_link
      drink_pref
      skin_type
      birthday
      phone
      coffee_pref
      employee_pref
      favourite_service
      allergies
      last_visit_notes
      image
      is_blocked
      referral_code
      referred_by {
        id
        name
      }
    }
    allReservations: myReservations {
      id
      date
      status
      duration
      total_price
      drink_choice
      genre
      service {
        id
        name
        price
      price_homme
      price_femme
      visibility
        duration
        visibility
      }
      user {
        id
        name
        email
        drink_pref
      }
      prestataire {
        id
        name
        image
      }
    }
    externalEvents {
      id
      google_event_id
      title
      startDate
      endDate
      reservationId
    }
    allDrinks {
      id
      name
      image
      available
    }
  }
`;

export const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      name
      description
      price
      image
    }
  }
`;

export const GET_WAITING_DATA = gql`
  query GetWaitingData($userId: ID) {
    waitingComments {
      id
      comment
      createdAt
      user {
        name
      }
    }
    myReservations(userId: $userId) {
        id
        status
      duration
      total_price
        date
        service {
            name
            duration
        visibility
            price
      price_homme
      price_femme
      visibility
        }
        drink_choice
        prestataire {
            name
            role
            image
        }
    }
  }
`;

export const GET_USER_RESERVATIONS = gql`
  query GetUserReservations {
    myReservations {
      id
      date
      status
      duration
      total_price
      drink_choice
      service {
        name
        price
      price_homme
      price_femme
      visibility
        image
      }
      prestataire {
        name
        role
        image
      }
    }
  }
`;

export const GET_SERVICE = gql`
  query GetService($id: ID!) {
    service(id: $id) {
      id
      name
      description
      price
      price_homme
      price_femme
      visibility
      image
      duration
      enabled
      categoryId
    }
  }
`;
export const GET_SERVICE_CATEGORIES = gql`
  query GetServiceCategories {
    serviceCategories {
      id
      name
    }
  }
`;
export const GET_ALL_FEEDBACK = gql`
  query GetAllFeedback {
    waitingComments {
      id
      comment
      createdAt
      user {
        name
        email
      }
    }
    personnelEvaluations {
      id
      rating
      comment
      createdAt
      user {
        name
      }
      prestataire {
        name
        role
      }
    }
  }
`;

export const GET_CLIENT_NOTES = gql`
  query GetClientNotes($clientId: ID) {
    clientNotes(clientId: $clientId) {
      id
      content
      createdAt
      author {
        id
        name
        role
      }
      client {
        id
        name
      }
    }
  }
`;
export const GET_SPECIALIST = gql`
  query GetSpecialist($id: ID!) {
    prestataire(id: $id) {
      id
      name
      role
      image
      rating
      specialty
      historique
      satisfied_clients
      tech_expertise
      hosp_expertise
      prec_expertise
      award_badge
      calendar_color_id
      service_id
      evaluations {
        id
        rating
        comment
        createdAt
        user {
          name
          image
        }
      }
    }
  }
`;

export const ADD_DRINK = gql`
  mutation AddDrink($name: String!, $image: String) {
    addDrink(name: $name, image: $image) {
      id
      name
      image
    }
  }
`;

export const REMOVE_DRINK = gql`
  mutation RemoveDrink($id: ID!) {
    removeDrink(id: $id)
  }
`;

export const UPDATE_RESERVATION_DRINK = gql`
  mutation UpdateReservationDrink($id: ID!, $drinkChoice: String!) {
    updateReservationDrink(id: $id, drinkChoice: $drinkChoice) {
      id
      drink_choice
    }
  }
`;
