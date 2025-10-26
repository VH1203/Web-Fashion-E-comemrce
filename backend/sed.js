require("dotenv").config();
const mongoose = require("mongoose");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: "WDP" });
    const result = await mongoose.connection.db
      .collection("tickets")
      .dropIndex("id_1");
    console.log("✅ Dropped index id_1 from tickets:", result);
  } catch (err) {
    console.error("⚠️ Drop index error:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
