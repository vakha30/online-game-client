export type UserType = {
  name: string;
  login: string;
};

export type AuthType = {
  token: string;
  user: UserType;
};
