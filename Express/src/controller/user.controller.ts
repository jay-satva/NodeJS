export const getUsers = async (req, res) => {
  const users = await getAllUsers();
  res.json(users);
};