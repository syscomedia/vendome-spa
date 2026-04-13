import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      user {
        id
        email
        name
        role
      }
      error
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($email: String!, $password: String!, $name: String!) {
    register(email: $email, password: $password, name: $name) {
      user {
        id
        email
        name
        role
      }
      error
    }
  }
`;

export const SYNC_GOOGLE_USER_MUTATION = gql`
  mutation SyncGoogleUser($email: String!, $name: String!) {
    syncGoogleUser(email: $email, name: $name) {
      user {
        id
        email
        name
        role
      }
      error
    }
  }
`;

export const CREATE_RESERVATION_MUTATION = gql`
  mutation CreateReservation($userId: ID!, $serviceId: ID!, $prestataireId: ID!, $date: String!) {
    createReservation(userId: $userId, serviceId: $serviceId, prestataireId: $prestataireId, date: $date) {
      id
      date
      status
    }
  }
`;

export const ADD_WAITING_COMMENT_MUTATION = gql`
  mutation AddWaitingComment($userId: ID!, $comment: String!) {
    addWaitingComment(userId: $userId, comment: $comment) {
      id
      comment
      createdAt
      user {
        name
      }
    }
  }
`;

export const ADD_TIP_MUTATION = gql`
  mutation AddTip($userId: ID!, $prestataireId: ID!, $amount: Float!) {
    addTip(userId: $userId, prestataireId: $prestataireId, amount: $amount)
  }
`;

export const APPLY_REFERRAL_MUTATION = gql`
  mutation ApplyReferral($userId: ID!, $code: String!) {
    applyReferral(userId: $userId, code: $code)
  }
`;

export const ADD_PERSONNEL_EVALUATION_MUTATION = gql`
  mutation AddPersonnelEvaluation($userId: ID!, $personnelId: ID!, $rating: Int!, $comment: String!) {
    addPersonnelEvaluation(userId: $userId, personnelId: $personnelId, rating: $rating, comment: $comment)
  }
`;

export const DELETE_RESERVATION_MUTATION = gql`
  mutation DeleteReservation($id: ID!) {
    deleteReservation(id: $id)
  }
`;

export const TOGGLE_SERVICE_MUTATION = gql`
  mutation ToggleService($id: ID!, $enabled: Boolean!) {
    toggleService(id: $id, enabled: $enabled) {
      id
      enabled
    }
  }
`;

export const REMOVE_SERVICE_MUTATION = gql`
  mutation RemoveService($id: ID!) {
    removeService(id: $id)
  }
`;

export const UPDATE_USER_ROLE_MUTATION = gql`
  mutation UpdateUserRole($userId: ID!, $role: String!) {
    updateUserRole(userId: $userId, role: $role) {
      id
      role
    }
  }
`;

export const REMOVE_USER_MUTATION = gql`
  mutation RemoveUser($userId: ID!) {
    removeUser(userId: $userId)
  }
`;
export const ADD_SERVICE_MUTATION = gql`
  mutation AddService($name: String!, $description: String!, $price: Float!, $image: String!, $duration: String!) {
    addService(name: $name, description: $description, price: $price, image: $image, duration: $duration) {
      id
      name
      enabled
    }
  }
`;



export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser(
    $userId: ID!, $email: String, $name: String, $role: String, $password: String, $tier: String,
    $hair_color_pref: String, $favorite_coupe: String, $nail_color_pref: String,
    $music_pref: String, $music_link: String, $drink_pref: String, $skin_type: String, $birthday: String, $phone: String,
    $coffee_pref: String, $employee_pref: String, $favourite_service: String,
    $allergies: String, $last_visit_notes: String, $image: String
  ) {
    updateUser(
      userId: $userId, email: $email, name: $name, role: $role, password: $password, tier: $tier,
      hair_color_pref: $hair_color_pref, favorite_coupe: $favorite_coupe, nail_color_pref: $nail_color_pref,
      music_pref: $music_pref, music_link: $music_link, drink_pref: $drink_pref, skin_type: $skin_type, birthday: $birthday, phone: $phone,
      coffee_pref: $coffee_pref, employee_pref: $employee_pref, favourite_service: $favourite_service,
      allergies: $allergies, last_visit_notes: $last_visit_notes, image: $image
    ) {
      id email name role points tier
      hair_color_pref favorite_coupe nail_color_pref music_pref music_link drink_pref
      skin_type birthday phone coffee_pref employee_pref favourite_service
      allergies last_visit_notes image
    }
  }
`;

export const UPDATE_SERVICE_MUTATION = gql`
  mutation UpdateService($id: ID!, $name: String, $description: String, $price: Float, $image: String, $duration: String) {
    updateService(id: $id, name: $name, description: $description, price: $price, image: $image, duration: $duration) {
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

export const ADD_PRODUCT_MUTATION = gql`
  mutation AddProduct($name: String!, $description: String!, $price: Float!, $image: String!) {
    addProduct(name: $name, description: $description, price: $price, image: $image) {
      id
      name
      price
    }
  }
`;

export const UPDATE_PRODUCT_MUTATION = gql`
  mutation UpdateProduct($id: ID!, $name: String, $description: String, $price: Float, $image: String) {
    updateProduct(id: $id, name: $name, description: $description, price: $price, image: $image) {
      id
      name
      description
      price
      image
    }
  }
`;

export const REMOVE_PRODUCT_MUTATION = gql`
  mutation RemoveProduct($id: ID!) {
    removeProduct(id: $id)
  }
`;

export const UPDATE_RESERVATION_STATUS_MUTATION = gql`
  mutation UpdateReservationStatus($id: ID!, $status: String!) {
    updateReservationStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export const UPDATE_SPECIALIST_MUTATION = gql`
  mutation UpdateSpecialist($id: ID!, $name: String, $role: String, $image: String, $specialty: String, $rating: Float, $historique: String) {
    updateSpecialist(id: $id, name: $name, role: $role, image: $image, specialty: $specialty, rating: $rating, historique: $historique) {
      id
      name
      role
      image
      rating
      specialty
      historique
    }
  }
`;

export const ADD_PRESTATAIRE_MUTATION = gql`
  mutation AddPrestataire($name: String!, $role: String!, $image: String!, $rating: Float!, $specialty: String!) {
    addPrestataire(name: $name, role: $role, image: $image, rating: $rating, specialty: $specialty) {
      id
      name
      role
      image
      rating
      specialty
    }
  }
`;
