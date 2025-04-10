// ********************** Initialize server **********************************

const server = require('../server/index'); // Path to your index.js

// ********************** Import Libraries ***********************************

const chai = require('chai'); 
const chaiHttp = require('chai-http');
chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;

// ********************** DEFAULT WELCOME TESTCASE ****************************

describe('Server!', () => {
  // Sample test case given to test / endpoint.
  it('Returns the default welcome message', done => {
    chai
      .request(server)
      .get('/welcome')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equals('success');
        assert.strictEqual(res.body.message, 'Welcome!');
        done();
      });
  });
});

// *********************** REGISTRATION TESTS **************************

describe('Registration API', () => {
  // Positive test case: Register with valid details
  it('should register a user with valid details', done => {
    // Create a unique username to avoid conflicts
    const uniqueUsername = 'testuser' + Date.now();
    
    chai
      .request(server)
      .post('/register')
      .send({
        email: uniqueUsername + '@example.com',
        username: uniqueUsername,
        password: 'Test1234!'  // Matches your password requirements
      })
      .end((err, res) => {
        expect(res).to.redirectTo(/\/login$/); // Should redirect to /login
        done();
      });
  });

  // Negative test case: Register with username that already exists
  it('should not register with an existing username', done => {
    // First create a user
    const username = 'existinguser' + Date.now();
    
    // Register once
    chai
      .request(server)
      .post('/register')
      .send({
        email: username + '@example.com',
        username: username,
        password: 'Test1234!'
      })
      .end(() => {
        // Then try to register again with same username but different email
        chai
          .request(server)
          .post('/register')
          .send({
            email: 'different' + username + '@example.com',
            username: username,
            password: 'Test1234!'
          })
          .end((err, res) => {
            expect(res).to.have.status(200); // Your error page status
            // Should render register page with error message
            expect(res.text).to.include('Username or email already registered');
            done();
          });
      });
  });
});

// *********************** LOGIN TESTS **************************

describe('Login API', () => {
  // Create a test user before running login tests
  const testUsername = 'logintest' + Date.now();
  const testPassword = 'Test1234!';
  
  before(done => {
    chai
      .request(server)
      .post('/register')
      .send({
        email: testUsername + '@example.com',
        username: testUsername,
        password: testPassword
      })
      .end(() => {
        done();
      });
  });

  // Positive test case: Login with valid credentials
  it('should login with valid credentials', done => {
    chai
      .request(server)
      .post('/login')
      .send({
        username: testUsername,
        password: testPassword
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.redirectTo(/\/home$/); // Should redirect to /home
        done();
      });
  });

  // Negative test case: Login with invalid password
  it('should not login with invalid password', done => {
    chai
      .request(server)
      .post('/login')
      .send({
        username: testUsername,
        password: 'wrongpassword'
      })
      .end((err, res) => {
        expect(res).to.have.status(200); // Renders login page with error
        expect(res.text).to.include('Incorrect Password');
        done();
      });
  });
});
