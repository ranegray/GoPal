// ********************** Initialize server **********************************

// const server = require('../server/index'); // Path to your index.js
const { app } = require('../server/index');

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
      .request(app)
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
      .request(app)
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
      .request(app)
      .post('/register')
      .send({
        email: username + '@example.com',
        username: username,
        password: 'Test1234!'
      })
      .end(() => {
        // Then try to register again with same username but different email
        chai
          .request(app)
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
      .request(app)
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
      .request(app)
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
      .request(app)
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

// *********************** JOURNAL API TESTS **************************

describe('Journal API', () => {
  // Use an agent to maintain login session
  const agent = chai.request.agent(app);
  const journalUser = 'journalUser' + Date.now();
  const journalPassword = 'Test1234!';

  // Register and Login user before journal tests
  before(done => {
      agent
          .post('/register')
          .send({
              email: journalUser + '@example.com',
              username: journalUser,
              password: journalPassword
          })
          .end((err, res) => {
              // Log the user in after registration
              agent
                  .post('/login')
                  .send({
                      username: journalUser,
                      password: journalPassword
                  })
                  .end((err, res) => {
                      // Verify login redirect occurred
                      expect(res).to.redirectTo(/\/home$/);
                      done();
                  });
          });
  });

  // Test fetching the journal page
  it('should display the journal page for a logged-in user', done => {
      agent
          .get('/journal')
          .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.text).to.include('Journal Entries'); // Check for page title
              expect(res.text).to.include('journal-add-button'); // Check if add button exists (by id)
              done();
          });
  });

  // Test adding a new journal entry
  it('should add a new journal entry', done => {
      const testTitle = 'My Test Entry Title ' + Date.now();
      const testEntry = 'This is the content of the test entry.';

      agent
          .post('/api/journal') // Your API endpoint for adding entries
          .send({
              'journal-title': testTitle, // Ensure names match form fields
              'journal-entry': testEntry
          })
          .end((err, res) => {
              expect(res).to.redirectTo(/\/journal$/); // Check for redirect

              // **Verification Step**: Check if the entry now appears on the page
              agent.get('/journal').end((err, pageRes) => {
                  expect(pageRes.text).to.include(testTitle);
                  expect(pageRes.text).to.include(testEntry.substring(0, 50)); // Check for partial entry text maybe
                  // If possible, try to extract the ID of the newly created entry here
                  // This is complex with just chai-http, might need regex or specific response format
                  // Example: const match = pageRes.text.match(/data-entry-id="(\d+)"/);
                  // if (match && match[1]) createdEntryId = match[1];
                  done();
              });
          });
  });

   // Test adding an entry with missing required fields (e.g., title)
  it('should fail to add an entry with a missing title', done => {
      agent
          .post('/api/journal')
          .send({
              // 'journal-title': 'Missing title',
              'journal-entry': 'Entry content without title'
          })
          .end((err, res) => {
              // Assuming failure redirects back to /journal with an error message
              // Adjust expected redirect/status based on your actual backend validation handling
              expect(res).to.redirectTo(/\/journal$/); // Check redirect includes an error param
              done();
          });
  });


  // Test deleting a journal entry
  // NOTE: This test assumes 'createdEntryId' was captured in the 'add' test.
  // If not captured, this test might fail or need modification (e.g., delete the *last* entry added).
  // A more robust approach involves the ADD endpoint returning the ID.
  // As a fallback, we try deleting *any* entry card's form found on the page.
// Test deleting a journal entry
// Inside it('should delete a journal entry', ...)

it('should delete a journal entry', (done) => {
  const deleteTitle = 'EntryToDelete ' + Date.now();
  agent // Add entry
     .post('/api/journal')
     .send({ 'journal-title': deleteTitle, 'journal-entry': 'Delete me.' })
     .redirects(0)
     .end((err, addRes) => {
         if (err || !addRes) return done(err || new Error('Add failed'));
         expect(addRes).to.have.status(302); // Status check
         expect(addRes).to.have.header('location', '/journal'); // Header check

         // Fetch the page to find the specific entry ID to delete
         agent.get('/journal').end((err, pageRes) => {
             if (err) return done(err);

             // --- MODIFIED ID FINDING LOGIC ---
             // 1. Escape the title for use in regex
             const escapedTitle = deleteTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
             // 2. Create a regex to find the title and then capture the NEXT form action URL
             const specificDeleteRegex = new RegExp(escapedTitle + '[\\s\\S]*?<form[^>]+action="(\/api\/journal\/\\d+)"');
             //    - escapedTitle: Matches the specific title text.
             //    - [\\s\\S]*?: Matches any character (including newlines) non-greedily until...
             //    - <form[^>]+action="...": Finds the start of a form tag with an action attribute.
             //    - (\/api\/journal\/\\d+): Captures the delete URL path.

             const match = pageRes.text.match(specificDeleteRegex);
             // --- END MODIFIED ID FINDING LOGIC ---

             if (!match || !match[1]) {
                 // Fail properly if the specific entry's delete form wasn't found
                 return done(new Error(`Could not find delete form associated with title: ${deleteTitle}`));
             }
             const deleteUrl = match[1]; // Should be the URL for the correct entry

             // Attempt the deletion using the specific URL
             agent.post(deleteUrl)
                 .end((err, deleteRes) => {
                     if (err) return done(err);
                     expect(deleteRes).to.redirectTo(/\/journal\?success=.*deleted/);

                     // Verification Step
                     agent.get('/journal').end((err, finalPageRes) => {
                         if (err) return done(err);
                         // This assertion should now pass if the correct entry was deleted
                         expect(finalPageRes.text).to.not.include(deleteTitle);
                         done();
                     });
                 });
         });
     });
  });


  // Test attempting to delete a non-existent entry
  it('should fail to delete a non-existent journal entry', done => {
      agent
          .post('/api/journal/999999999') // Use an ID that very likely doesn't exist
          .end((err, res) => {
              // Assuming failure redirects back to /journal with an error
              expect(res).to.redirectTo(/\/journal\?error=Journal%20entry%20not%20found$/); // Adjust error message
               // Or check for a 404 status if your API returns that
               // expect(res).to.have.status(404);
              done();
          });
  });


  // Logout the user after tests (optional cleanup)
  after(done => {
      agent.get('/logout').end(() => done());
  });
});