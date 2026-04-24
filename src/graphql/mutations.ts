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
  mutation CreateReservation($userId: ID!, $serviceId: ID!, $prestataireId: ID!, $date: String!, $totalPrice: Float, $genre: String) {
    createReservation(userId: $userId, serviceId: $serviceId, prestataireId: $prestataireId, date: $date, totalPrice: $totalPrice, genre: $genre) {
      id
      date
      status
      genre
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

export const APPLY_REFERRAL_CODE_MUTATION = gql`
  mutation ApplyReferralCode($userId: ID!, $code: String!) {
    applyReferralCode(userId: $userId, code: $code) {
      id
      referral_code
      referred_by {
        id
        name
      }
    }
  }
`;

export const GENERATE_REFERRAL_CODE_MUTATION = gql`
  mutation GenerateReferralCode($userId: ID!) {
    generateReferralCode(userId: $userId) {
      id
      referral_code
    }
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
  mutation AddService($name: String!, $description: String!, $price: Float!, $price_homme: Float, $price_femme: Float, $image: String!, $duration: String!, $visibility: String, $categoryId: ID) {
    addService(name: $name, description: $description, price: $price, price_homme: $price_homme, price_femme: $price_femme, image: $image, duration: $duration, visibility: $visibility, categoryId: $categoryId) {
      id
      name
      enabled
      price_homme
      price_femme
      visibility
      categoryId
    }
  }
`;

export const ADD_SERVICE_CATEGORY_MUTATION = gql`
  mutation AddServiceCategory($name: String!) {
    addServiceCategory(name: $name) {
      id
      name
    }
  }
`;

export const UPDATE_SERVICE_CATEGORY_MUTATION = gql`
  mutation UpdateServiceCategory($id: ID!, $name: String!) {
    updateServiceCategory(id: $id, name: $name) {
      id
      name
    }
  }
`;

export const REMOVE_SERVICE_CATEGORY_MUTATION = gql`
  mutation RemoveServiceCategory($id: ID!) {
    removeServiceCategory(id: $id)
  }
`;



export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser(
    $userId: ID!, $email: String, $name: String, $role: String, $password: String, $tier: String,
    $hair_color_pref: String, $favorite_coupe: String, $nail_color_pref: String,
    $music_pref: String, $music_link: String, $drink_pref: String, $skin_type: String, $birthday: String, $phone: String,
    $coffee_pref: String, $employee_pref: String, $favourite_service: String,
    $allergies: String, $last_visit_notes: String, $image: String, $is_blocked: Boolean
  ) {
    updateUser(
      userId: $userId, email: $email, name: $name, role: $role, password: $password, tier: $tier,
      hair_color_pref: $hair_color_pref, favorite_coupe: $favorite_coupe, nail_color_pref: $nail_color_pref,
      music_pref: $music_pref, music_link: $music_link, drink_pref: $drink_pref, skin_type: $skin_type, birthday: $birthday, phone: $phone,
      coffee_pref: $coffee_pref, employee_pref: $employee_pref, favourite_service: $favourite_service,
      allergies: $allergies, last_visit_notes: $last_visit_notes, image: $image, is_blocked: $is_blocked
    ) {
      id email name role points tier
      hair_color_pref favorite_coupe nail_color_pref music_pref music_link drink_pref
      skin_type birthday phone coffee_pref employee_pref favourite_service
      allergies last_visit_notes image is_blocked
    }
  }
`;

export const UPDATE_SERVICE_MUTATION = gql`
  mutation UpdateService($id: ID!, $name: String, $description: String, $price: Float, $price_homme: Float, $price_femme: Float, $image: String, $duration: String, $visibility: String, $categoryId: ID) {
    updateService(id: $id, name: $name, description: $description, price: $price, price_homme: $price_homme, price_femme: $price_femme, image: $image, duration: $duration, visibility: $visibility, categoryId: $categoryId) {
      id
      name
      description
      price
      price_homme
      price_femme
      image
      duration
      enabled
      visibility
      categoryId
    }
  }
`;

export const ADD_PRODUCT_MUTATION = gql`
  mutation AddProduct($name: String!, $description: String, $price: Float!, $image: String) {
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
  mutation UpdateReservationStatus($id: ID!, $status: String!, $paymentMode: String) {
    updateReservationStatus(id: $id, status: $status, paymentMode: $paymentMode) {
      id
      status
      paymentMode
      externalTitle
    }
  }
`;

export const UPDATE_SPECIALIST_MUTATION = gql`
  mutation UpdateSpecialist($id: ID!, $name: String, $role: String, $image: String, $specialty: String, $rating: Float, $historique: String, $satisfied_clients: String, $tech_expertise: Int, $hosp_expertise: Int, $prec_expertise: Int, $award_badge: String, $calendar_color_id: String, $serviceId: ID) {
    updateSpecialist(id: $id, name: $name, role: $role, image: $image, specialty: $specialty, rating: $rating, historique: $historique, satisfied_clients: $satisfied_clients, tech_expertise: $tech_expertise, hosp_expertise: $hosp_expertise, prec_expertise: $prec_expertise, award_badge: $award_badge, calendar_color_id: $calendar_color_id, serviceId: $serviceId) {
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
  }
`;

export const ADD_PRESTATAIRE_MUTATION = gql`
  mutation AddPrestataire($name: String!, $role: String!, $image: String!, $rating: Float!, $specialty: String!, $satisfied_clients: String, $tech_expertise: Int, $hosp_expertise: Int, $prec_expertise: Int, $award_badge: String, $calendar_color_id: String, $serviceId: ID) {
    addPrestataire(name: $name, role: $role, image: $image, rating: $rating, specialty: $specialty, satisfied_clients: $satisfied_clients, tech_expertise: $tech_expertise, hosp_expertise: $hosp_expertise, prec_expertise: $prec_expertise, award_badge: $award_badge, calendar_color_id: $calendar_color_id, serviceId: $serviceId) {
      id
      name
      role
      image
      rating
      specialty
      satisfied_clients
      tech_expertise
      hosp_expertise
      prec_expertise
      award_badge
      calendar_color_id
      service_id
    }
  }
`;

export const ADD_CLIENT_NOTE_MUTATION = gql`
  mutation AddClientNote($clientId: ID!, $authorId: ID!, $content: String!) {
    addClientNote(clientId: $clientId, authorId: $authorId, content: $content) {
      id
      content
      createdAt
      author {
        id
        name
      }
    }
  }
`;
export const DELETE_SPECIALIST_MUTATION = gql`
  mutation DeleteSpecialist($id: ID!) {
    deleteSpecialist(id: $id)
  }
`;

export const UPDATE_RESERVATION_DATE_MUTATION = gql`
  mutation UpdateReservationDate($id: ID!, $date: String!) {
    updateReservationDate(id: $id, date: $date) {
      id
      date
      status
      externalTitle
    }
  }
`;

export const SYNC_GOOGLE_CALENDAR_MUTATION = gql`
  mutation SyncGoogleCalendar {
    syncGoogleCalendar
  }
`;

export const CONVERT_EXTERNAL_TO_RESERVATION_MUTATION = gql`
  mutation ConvertExternalToReservation($externalId: ID!, $userId: ID!, $serviceId: ID!, $prestataireId: ID!) {
    convertExternalToReservation(externalId: $externalId, userId: $userId, serviceId: $serviceId, prestataireId: $prestataireId) {
      id
      date
      status
      externalTitle
    }
  }
`;

export const DEDUCT_POINTS_MUTATION = gql`
  mutation DeductPoints($userId: ID!, $points: Int!) {
    deductPoints(userId: $userId, points: $points) {
      id
      name
      points
    }
  }
`;

export const PURCHASE_PRODUCT_MUTATION = gql`
  mutation PurchaseProduct($userId: ID!, $productId: ID!) {
    purchaseProduct(userId: $userId, productId: $productId)
  }
`;
