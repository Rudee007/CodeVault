// scripts/fixTextIndex.js

const mongoose = require('mongoose');
require('dotenv').config();

async function fixTextIndex() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('snippets');

    // List all indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(i => i.name));

    // Drop the old text index
    try {
      await collection.dropIndex('advanced_snippet_search');
      console.log('✅ Dropped old text index');
    } catch (error) {
      console.log('ℹ️  Index does not exist or already dropped');
    }

    console.log('✅ Index fix complete. Restart your server to recreate the index.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixTextIndex();
