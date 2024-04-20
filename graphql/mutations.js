import { gql } from "graphql-request";

export const CreateNextUserMutation = gql`
  mutation CreateNextUser($userData: NextUserCreateInput!) {
    createNextUser(data: $userData) {
      id
      email
    }
  }
`;

export const GetUserByEmailQuery = gql`
query getUserByEmailQuery($email: String!) {
  studentDetail(where: {email_Id: $email}) {
    email_Id
    firstname
    lastname
    contactNumber
    password
    studentSlug
  }
}
`;
