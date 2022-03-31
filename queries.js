const Pool = require("pg").Pool;
const pool = new Pool({
  user: "me",
  host: "localhost",
  database: "api",
  password: "password",
  port: 5432,
});
const jwt = require("jsonwebtoken");
const mySecret = "myKeyTeesas";

// POST request for signUp
const signUp = (request, response) => {
  const {
    childname,
    email,
    phonenumber,
    countrycode,
    password,
    confirmpassword,
    grade,
  } = request.body;

  // check if user already exists
  pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email],
    (error, result) => {
      if (error) console.log(error);
      if (result.rowCount > 0) {
        return response.status(400).json({
          status: false,
          message: "a user with that email already exists",
        });
      }
    }
  );
  // check if passwords match
  if (password != confirmpassword) {
    return response
      .status(400)
      .json({ status: false, message: "invalid password" });
  }

  pool.query(
    "INSERT INTO users (childname, email, phoneNumber, countryCode, password, confirmPassword, grade) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    [
      childname,
      email.toLowerCase(),
      phonenumber,
      countrycode,
      password,
      confirmpassword,
      grade,
    ],
    (error, results) => {
      if (error) {
        return response
          .status(500)
          .json({ status: false, message: "something went wrong" });
      }
      response
        .status(201)
        .json({ status: true, message: "learner created successfully" });
    }
  );
};

// POST request at signIn
const signIn = (request, response) => {
  const { email, password } = request.body;
  pool.query(
    "SELECT password FROM users WHERE email = $1",
    [email.toLowerCase()],
    (error, result) => {
      if (error || result.length === 0 || result.rows[0].password != password) {
        return response.status(401).json({
          status: false,
          message: "invalid email or password",
        });
      }
      const token = jwt.sign({ email: email }, mySecret, {
        expiresIn: "2h",
      });
      response.status(200).json({
        status: true,
        message: "login successful",
        token: token,
      });
    }
  );
};

// GET request for lessons
const getLessons = (request, response) => {
  let token = request.header("AUTHORIZATION");
  if (!token) {
    return response.status(403).json({
      status: false,
      message: "please input a token",
    });
  }
  // verify token
  token = token.slice("Bearer ".length);
  let decode;
  try {
    decode = jwt.verify(token, mySecret);
  } catch (error) {
    console.log(error);
    return response.status(403).json({
      status: false,
      message: "invalid token",
    });
  }
  pool.query("SELECT * FROM mylessons ORDER BY id ASC", (error, results) => {
    if (error) {
      console.log(error);
      return response
        .status(400)
        .json({ status: 400, message: "Something went wrong." });
    }
    response.json({
      success: true,
      message: "Success.",
      data: results.rows,
    });
  });
};

///prettier-ignore

module.exports = { signUp, signIn, getLessons };
