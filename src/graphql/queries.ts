import { gql } from '@apollo/client';

export const GET_DASHBOARD_DATA = gql`
  query GetDashboardData {
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
    }
    amenities {
      name
      image
    }
    userLoyalty {
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
    }
    allReservations: myReservations {
      id
      date
      status
      service {
        id
        name
        price
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
