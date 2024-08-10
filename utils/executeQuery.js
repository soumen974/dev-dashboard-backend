const pool = require('../models/db');

const executeQuery = async (query, params) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(query, params);
    return JSON.parse(JSON.stringify(rows, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
};



module.exports = executeQuery;