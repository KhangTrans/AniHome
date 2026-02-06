export const MOCK_USERS = [
  {
    id: 1,
    email: 'admin@rescue.com',
    password: '123',
    name: 'Super Admin',
    role: 'super_admin',
    avatar: 'https://ui-avatars.com/api/?name=Super+Admin&background=FF6B6B&color=fff'
  },
  {
    id: 2,
    email: 'shelter@rescue.com',
    password: '123',
    name: 'Happy Paws Manager',
    role: 'shelter_admin',
    avatar: 'https://ui-avatars.com/api/?name=Shelter+Manager&background=4ECDC4&color=fff'
  },
  {
    id: 3,
    email: 'volunteer@rescue.com',
    password: '123',
    name: 'Sarah Volunteer',
    role: 'volunteer',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+V&background=FFEaa7&color=000'
  },
  {
    id: 4,
    email: 'user@gmail.com',
    password: '123',
    name: 'John Doe',
    role: 'adopter',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random'
  }
];

export const checkCredentials = (email, password) => {
  const user = MOCK_USERS.find(u => u.email === email && u.password === password);
  if (user) {
    const { password, ...userWithoutPass } = user;
    return userWithoutPass;
  }
  return null;
};
