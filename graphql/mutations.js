import { gql } from "graphql-request";

export const CreateNextUserMutation = gql`
  mutation MyQuery(
    $email_Id: String!
    $studentSlug: String!
    $studentId: Int!
    $password: String!
    $firstname: String!
    $lastname: String!
    $contactNumber: Int!
  ) {
    createStudentDetail(
      data: {
        email_Id: $email_Id
        studentSlug: $studentSlug
        studentId: $studentId
        password: $password
        firstname: $firstname
        lastname: $lastname
        contactNumber: $contactNumber
      }
    ) {
      contactNumber
      email_Id
      firstname
    }
  }
`;

// export const GetUserByEmailQuery = gql`
//   query getUserByEmailQuery($email: String!) {
//     studentDetail(where: { email_Id: $email }) {
//       email_Id
//       firstname
//       lastname
//       contactNumber
//       password
//       studentSlug
//     }
//   }
// `;

export const GetUserByEmailQuery = gql`
  query getUserByEmailQuery($email: String!) {
    studentDetail(where: { email_Id: $email }) {
      email_Id
      firstname
      lastname
      contactNumber
      password
      studentSlug
      studentId
      subjectDates {
        subjectDateAndTime
        subject {
          subjectName
          subjectSlug
          subject_Id
        }
      }
      timeTables(where: { studentDetails_some: { email_Id: $email } }) {
        csv {
          url
          id
          fileName
        }
      }
      id
      requests(where: { studentDetail: { email_Id: $email } }) {
        id
        requestDescription
        requestId
        requestTitle
      }
    }
  }
`;

export const GetAdminDetailsQuery = gql`
  query GetAdminDetailsQuery($email: String) {
    admin(where: { adminEmail: $email }) {
      adminEmail
      adminId
      adminName
      studentDetails {
        firstname
        email_Id
        subjects_picked {
          subjectName
          subjectSlug
        }
        subjectDates {
          subjectDateId
        }
        timeTables {
          timetableId
        }
      }
      adminPassword
      adminSlug
      notices {
        noticeId
        noticeDescription
        id
        active
      }
      requests {
        requestDescription
        requestId
        requestTitle
        studentDetail {
          firstname
          lastname
        }
      }
    }
  }
`;

export const CreateNoticeMutation = gql`
  mutation createNotice(
    $email: String!
    $id: Int!
    $description: String!
    $active: Boolean
  ) {
    createNotice(
      data: {
        admin: { connect: { adminEmail: $email } }
        noticeId: $id
        noticeDescription: $description
        active: $active
      }
    ) {
      noticeDescription
      noticeId
      id
      active
    }
  }
`;

export const publishNotice = gql`
  mutation publishNotice($ID: ID) {
    publishNotice(where: { id: $ID }) {
      id
    }
  }
`;

export const publishRequest = gql`
  mutation publishRequest($ID: ID) {
    publishRequest(where: { id: $ID }) {
      id
      requestId
      requestTitle
      requestDescription
    }
  }
`;

export const deleteNotice = gql`
  mutation deleteNotice($id: ID!) {
    deleteNotice(where: { id: $id }) {
      noticeDescription
      noticeId
    }
  }
`;

export const updateNotice = gql`
  mutation updateNotice($id: ID!, $active: Boolean!) {
    updateNotice(where: { id: $id }, data: { active: $active }) {
      noticeDescription
      noticeId
      active
      id
    }
  }
`;

export const CreateRequest = gql`
  mutation createRequest(
    $studentEmail: String!
    $requestTitle: String
    $requestDescription: String!
    $requestId: Int
  ) {
    createRequest(
      data: {
        admin: { connect: { adminEmail: "admin@gmail.com" } }
        requestTitle: $requestTitle
        requestDescription: $requestDescription
        requestId: $requestId
        studentDetail: { connect: { email_Id: $studentEmail } }
      }
    ) {
      id
      requestId
      requestDescription
      requestTitle
      studentDetail {
        firstname
        lastname
      }
    }
  }
`;

export const getNotices = gql`
  query getNotice {
    notices(where: { active: true }) {
      noticeId
      noticeDescription
      active
    }
  }
`;

export const createSubjectDate = gql`
  mutation CreateSubjectDateTime(
    $subjectId: Int!
    $emailId: String!
    $subjectSlug: String!
    $subjectDateTime: [DateTime!]
  ) {
    createSubjectDate(
      data: {
        subjectDateId: $subjectId
        studentDetail: { connect: { StudentDetail: { email_Id: $emailId } } }
        subject: { connect: { subjectSlug: $subjectSlug } }
        subjectDateAndTime: $subjectDateTime
      }
    ) {
      id
      subjectDateAndTime
      subjectDateId
      studentDetail {
        ... on StudentDetail {
          id
          firstname
          email_Id
        }
      }
      subject {
        subjectName
        subjectSlug
      }
    }
  }
`;

export const PublishSubjectDate = gql`
  mutation PublishSubjectDateTime($ID: ID!) {
    publishSubjectDate(where: { id: $ID }) {
      subjectDateAndTime
      subjectDateId
      subject {
        subjectName
        subjectSlug
      }
      studentDetail {
        ... on StudentDetail {
          id
          firstname
          email_Id
        }
      }
    }
  }
`;
