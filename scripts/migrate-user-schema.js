/* eslint-disable no-console */
const mongoose = require('mongoose');
const config = require('../src/config/config');

const LEGACY_PROFILE_FIELDS = ['first_name', 'last_name', 'is_whatsapp_enabled', 'is_placed', 'college'];

function toObjectIdIfValid(value) {
  if (!value || typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed || !mongoose.Types.ObjectId.isValid(trimmed)) {
    return undefined;
  }

  return new mongoose.Types.ObjectId(trimmed);
}

async function migrate() {
  await mongoose.connect(config.mongoose.url, config.mongoose.options);
  const { db } = mongoose.connection;

  const usersCollection = db.collection('users');
  const profilesCollection = db.collection('user_profiles');

  const users = await usersCollection.find({}).toArray();

  let updatedUsers = 0;
  let upsertedProfiles = 0;

  await Promise.all(
    users.map(async (user) => {
      const userSet = {};
      const userUnset = {};

      if (!user.password_hash && user.pw) {
        userSet.password_hash = user.pw;
        userUnset.pw = '';
      }

      if (!user.role) {
        userSet.role = 'student';
      }

      if (typeof user.is_active !== 'boolean') {
        userSet.is_active = true;
      }

      if (!user.created_at) {
        userSet.created_at = new Date();
      }

      const profileUpdate = {
        updated_at: new Date(),
      };

      if (user.first_name) {
        profileUpdate.first_name = user.first_name;
        userUnset.first_name = '';
      }

      if (user.last_name) {
        profileUpdate.last_name = user.last_name;
        userUnset.last_name = '';
      }

      if (typeof user.is_whatsapp_enabled === 'boolean') {
        profileUpdate.is_whatsapp_enabled = user.is_whatsapp_enabled;
        userUnset.is_whatsapp_enabled = '';
      }

      if (typeof user.is_placed === 'boolean') {
        profileUpdate.is_placed = user.is_placed;
        userUnset.is_placed = '';
      }

      const maybeCollegeId = toObjectIdIfValid(user.college);
      if (maybeCollegeId) {
        profileUpdate.collegeId = maybeCollegeId;
      }
      if (user.college !== undefined) {
        userUnset.college = '';
      }

      const hasLegacyProfileData = LEGACY_PROFILE_FIELDS.some((field) => user[field] !== undefined);

      await profilesCollection.updateOne(
        { userId: user._id },
        {
          $set: {
            userId: user._id,
            visibility: 'public',
            ...profileUpdate,
          },
          $setOnInsert: {
            created_at: new Date(),
          },
        },
        { upsert: hasLegacyProfileData }
      );

      if (Object.keys(userSet).length || Object.keys(userUnset).length) {
        await usersCollection.updateOne(
          { _id: user._id },
          {
            ...(Object.keys(userSet).length ? { $set: userSet } : {}),
            ...(Object.keys(userUnset).length ? { $unset: userUnset } : {}),
          }
        );
        updatedUsers += 1;
      }

      if (hasLegacyProfileData) {
        upsertedProfiles += 1;
      }
    })
  );

  console.log(`Migration complete. Updated users: ${updatedUsers}. Upserted profiles: ${upsertedProfiles}.`);
}

migrate()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Migration failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  });
