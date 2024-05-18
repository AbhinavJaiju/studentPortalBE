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
  studentDetail(where: {email_Id: $email}) {
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
    timeTables(where: {studentDetails_some: {email_Id: $email}}) {
      csv {
        url
        id
        fileName
      }
    }
  }
}`
