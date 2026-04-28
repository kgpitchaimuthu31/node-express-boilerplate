/* eslint-disable no-console */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../src/config/config');

async function seed() {
  await mongoose.connect(config.mongoose.url, config.mongoose.options);
  const { db } = mongoose.connection;

  const usersCollection = db.collection('users');
  const profilesCollection = db.collection('user_profiles');

  const now = new Date();
  const defaultPasswordHash = await bcrypt.hash('Pass@123', 8);

  const profileIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
  const userIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

  const sampleUsers = [
    {
      _id: userIds[0],
      phone_number: '9000000001',
      email: 'student.one@example.com',
      password_hash: defaultPasswordHash,
      role: 'student',
      is_active: true,
      created_at: now,
      profile_id: profileIds[0],
    },
    {
      _id: userIds[1],
      phone_number: '9000000002',
      email: 'student.two@example.com',
      password_hash: defaultPasswordHash,
      role: 'student',
      is_active: true,
      created_at: now,
      profile_id: profileIds[1],
    },
    {
      _id: userIds[2],
      phone_number: '9000000003',
      email: 'college.admin@example.com',
      password_hash: defaultPasswordHash,
      role: 'college_admin',
      is_active: true,
      created_at: now,
      profile_id: profileIds[2],
    },
  ];

  const sampleProfiles = [
    {
      _id: profileIds[0],
      userId: userIds[0],
      first_name: 'Student',
      last_name: 'One',
      is_whatsapp_enabled: true,
      is_placed: false,
      visibility: 'public',
      created_at: now,
      updated_at: now,
    },
    {
      _id: profileIds[1],
      userId: userIds[1],
      first_name: 'Student',
      last_name: 'Two',
      is_whatsapp_enabled: false,
      is_placed: false,
      visibility: 'restricted',
      created_at: now,
      updated_at: now,
    },
    {
      _id: profileIds[2],
      userId: userIds[2],
      first_name: 'College',
      last_name: 'Admin',
      is_whatsapp_enabled: true,
      is_placed: true,
      visibility: 'private',
      created_at: now,
      updated_at: now,
    },
  ];

  await usersCollection.bulkWrite(
    sampleUsers.map((user) => ({
      updateOne: {
        filter: { _id: user._id },
        update: { $set: user },
        upsert: true,
      },
    }))
  );

  await profilesCollection.bulkWrite(
    sampleProfiles.map((profile) => ({
      updateOne: {
        filter: { _id: profile._id },
        update: { $set: profile },
        upsert: true,
      },
    }))
  );

  console.log(`Seed complete. Upserted ${sampleUsers.length} users and ${sampleProfiles.length} profiles.`);
}

seed()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Seed failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  });
