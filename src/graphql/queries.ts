import { gql } from '@apollo/client';

export const GET_DASHBOARD_DATA = gql`
  query GetDashboardData($userId: ID) {
    services {
      id
      name
      description
      price
      image
      duration
      enabled
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
    }
    amenities {
      name
      image
    }
    userLoyalty(userId: $userId) {
      points
      tier
      nextReward
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
    }
    allReservations: myReservations {
      id
      date
      status
      service {
        id
        name
        price
        duration
      }
      user {
        id
        name
        email
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
        date
        service {
            name
            duration
            price
        }
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
      service {
        name
        price
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
      image
      duration
      enabled
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
