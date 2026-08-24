const userModel = require('./backend/src/models/userModel');

async function test() {
  try {
    const existingUser = await userModel.findUserByEmail('john@example.com');
    console.log('Existing:', existingUser);
    
    if (!existingUser) {
      const newUser = await userModel.createUser('John Normal', 'john@example.com', 'Temp@123', '123 User St NY', 'USER');
      console.log('Created:', newUser);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}
test();
