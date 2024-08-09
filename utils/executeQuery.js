
const executeQuery = async (operation) => {
  try {
    const result = await operation();
    return result;
  } catch (err) {
    console.error('Error executing MongoDB operation:', err);
    throw err;
  }
};

module.exports = executeQuery;
